'use server';

import { searchPricing } from '../lib/rag';
import { detectZone, formatZoneDisplay, getZoneInfo, formatRupiah } from '../lib/zone-pricing';
import {
    smartApiCall,
    aiResponseCache,
    retryWithBackoff,
    getRateLimitStatus
} from '../lib/rate-limiter';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// =====================================================
// KONFIGURASI & KONSTANTA
// =====================================================

const MAX_INPUT_LENGTH = 1000; // Mencegah ReDOS & Token Abuse
const DEFAULT_SYSTEM_INSTRUCTION = "PERAN: Kamu adalah Konsultan Digital Interior profesional.";

// Pre-compiled Regex untuk performa
const REGEX_LOCATION = [
    /(?:di|lokasi|daerah|area|kota|alamat)\s+([a-zA-Z\s]+)/i,
    /(?:saya\s+(?:di|dari))\s+([a-zA-Z\s]+)/i,
    /([a-zA-Z\s]+)(?:\s+(?:dong|ya|please|tolong))?$/i
];

const REGEX_QUANTITY = [
    /(\d+(?:[.,]\d+)?)\s*(?:m|meter|m'|meter'|meter lari)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:m²|m2|meter persegi)/i,
    /(?:ukuran|panjang|lebar|size)\s*[:\s]*(\d+(?:[.,]\d+)?)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:x|\×)\s*(\d+(?:[.,]\d+)?)/i // Format P x L
];

const REGEX_ESTIMATION_KEYWORDS = [
    'estimasi', 'harga', 'berapa', 'biaya', 'budget', 'price',
    'kisaran', 'perkiraan', 'kira-kira', 'total', 'cost'
];

const REGEX_SURVEY_KEYWORDS = [
    'survei', 'survey', 'booking', 'pesan', 'order', 'jadwal',
    'konsultasi', 'kunjungan', 'datang', 'lihat lokasi'
];

// Cache rules di memori (module scope) untuk mengurangi Disk I/O
let cachedRules: string | null = null;

// =====================================================
// HELPER FUNCTIONS (Logic & Utilities)
// =====================================================

/**
 * Validasi dan membersihkan input user
 */
function sanitizeInput(input: string): string {
    return input.trim().slice(0, MAX_INPUT_LENGTH);
}

/**
 * Membaca rules dari file dengan caching sederhana
 */
async function getSystemRules(): Promise<string> {
    if (cachedRules) return cachedRules;

    try {
        const rulesPath = path.join(process.cwd(), 'rag_data', 'ai_behavior_rules.txt');
        cachedRules = await fs.readFile(rulesPath, 'utf-8');
        return cachedRules;
    } catch (error) {
        console.error("[System] Gagal membaca file rules:", error);
        return DEFAULT_SYSTEM_INSTRUCTION;
    }
}

/**
 * Ekstraksi lokasi menggunakan regex yang sudah dikompilasi
 */
function extractLocation(message: string): string | null {
    for (const pattern of REGEX_LOCATION) {
        const match = message.match(pattern);
        if (match && match[1]) return match[1].trim();
    }
    return null;
}

/**
 * Ekstraksi kuantitas/ukuran
 */
function extractQuantity(message: string): number | null {
    for (const pattern of REGEX_QUANTITY) {
        const match = message.match(pattern);
        if (match) {
            // Handle PxL format
            if (match[2]) {
                const p = parseFloat(match[1].replace(',', '.'));
                const l = parseFloat(match[2].replace(',', '.'));
                return !isNaN(p) && !isNaN(l) ? p * l : null;
            }
            const val = parseFloat(match[1].replace(',', '.'));
            return !isNaN(val) ? val : null;
        }
    }
    return null;
}

/**
 * Deteksi intent user
 */
function detectIntent(message: string) {
    const lowerMessage = message.toLowerCase();
    const isEstimation = REGEX_ESTIMATION_KEYWORDS.some(kw => lowerMessage.includes(kw));
    const isSurvey = REGEX_SURVEY_KEYWORDS.some(kw => lowerMessage.includes(kw));
    const isOptionSelection = /^[1-3]$/.test(message.trim());

    return { isEstimation, isSurvey, isOptionSelection };
}

// =====================================================
// MATH SOLVER (Mencegah Halusinasi Angka)
// =====================================================

function calculateDirectEstimation(
    message: string,
    quantity: number | null,
    isLuarKota: boolean = false
): string {
    const lowerMessage = message.toLowerCase();

    // 1. DETEKSI TIPE PRODUK
    const isBawahTangga = /bawah\s+tangga|bwt/i.test(message);
    const isWardrobe = /wardrobe|lemari\s+pakaian|lemari\s+baju/i.test(message);
    const isMinibar = /minibar|mini\s+bar|island/i.test(message);
    const isBackdrop = /backdrop|tv|televisi/i.test(message);

    // 2. DETEKSI DIMENSI & BUDGET
    const dimensionMatch = message.match(/(\d+(?:[.,]\d+)?)\s*(?:x|×)\s*(\d+(?:[.,]\d+)?)/i);
    const budgetMatch = message.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta|million)/i); // e.g 20jt

    let userBudget = 0;
    if (budgetMatch) {
        let val = parseFloat(budgetMatch[1].replace(',', '.'));
        userBudget = val * 1000000; // Convert '20' to 20.000.000
    }

    let totalQty = quantity || 0;
    let dimensionNote = "Menunggu input ukuran...";

    // Logic Dimensi
    if (dimensionMatch) {
        const sideA = parseFloat(dimensionMatch[1].replace(',', '.'));
        const sideB = parseFloat(dimensionMatch[2].replace(',', '.'));
        if (isWardrobe || isBackdrop) {
            totalQty = sideA * sideB;
            dimensionNote = `Luas Area ${sideA}m x ${sideB}m = ${totalQty} m² (Asumsi Luas)`;
        } else {
            totalQty = sideA + sideB;
            dimensionNote = `Asumsi L-Shape (${sideA}m + ${sideB}m)`;
        }
    } else if (quantity) {
        totalQty = quantity;
        dimensionNote = `Input user: ${quantity} unit`;
    }

    const zoneLabel = isLuarKota ? "Luar Kota" : "Dalam Kota";
    const p = (v: number) => formatRupiah(v);
    const cost = (v: number) => totalQty > 0 ? formatRupiah(totalQty * v) : "Tergantung Ukuran";

    // 3. DATABASE HARGA DINAMIS (Simplified Source of Truth)
    // Format: [Nama Produk, HargaDalam, HargaLuar]
    let productDB = [];

    if (isBawahTangga) {
        productDB = [
            { name: "Blockboard HPL (Minimalis)", price: isLuarKota ? 2400000 : 2300000 },
            { name: "Multipleks HPL (Standar)", price: isLuarKota ? 2600000 : 2500000 },
            { name: "Aluminium Premium (Anti Rayap)", price: 6000000 },
        ];
    } else if (isWardrobe) {
        productDB = [
            { name: "Blockboard HPL (Minimalis)", price: isLuarKota ? 2400000 : 2300000 },
            { name: "Multipleks HPL (Standar)", price: isLuarKota ? 2600000 : 2500000 },
            { name: "Aluminium Premium (Anti Rayap)", price: 5000000 },
        ];
    } else if (isMinibar) {
        productDB = [
            { name: "Blockboard HPL (Minimalis)", price: isLuarKota ? 2300000 : 2100000 },
            { name: "Aluminium Minimalis", price: 4850000 },
            { name: "Aluminium Luxury", price: 5500000 },
        ];
    } else {
        // KITCHEN SET (Default)
        productDB = [
            { name: "Blockboard HPL (Ekonomis)", price: isLuarKota ? 2300000 : 2000000 },
            { name: "Multipleks HPL (Best Seller)", price: isLuarKota ? 2600000 : 2500000 },
            { name: "Aluminium Minimalis (Anti Rayap)", price: 3500000 },
            { name: "Aluminium Semi Klasik (Elegant)", price: 5000000 },
            { name: "Aluminium Luxury (Premium)", price: 5500000 },
            { name: "PVC Board Royal (Anti Air)", price: isLuarKota ? 4100000 : 4000000 },
        ];
    }

    // 4. BUILD OUTPUT & REVERSE CALCULATION
    let resultList = "";
    let budgetAnalysis = "";

    // Jika user punya budget, bantu hitung MAX METER yg didapat
    if (userBudget > 0 && totalQty === 0) {
        budgetAnalysis = `\n[ANALISA BUDGET: ${formatRupiah(userBudget)}]`;
        productDB.forEach(item => {
            const maxMeter = (userBudget / item.price).toFixed(1);
            budgetAnalysis += `\n- Dengan ${item.name} (${p(item.price)}/m), budget cukup untuk: **±${maxMeter} Meter**`;
        });
        budgetAnalysis += "\n(Sampaikan ini ke user sebagai estimasi volume ruang dapur yang bisa dibuat)";
    }

    // Build Table Harga Normal
    productDB.forEach((item, idx) => {
        resultList += `${idx + 1}. ${item.name}: ${p(item.price)}/m ${totalQty > 0 ? `-> TOTAL: **${cost(item.price)}**` : ''}\n`;
    });

    return `
[SMART PRICING ENGINE V3]
Produk: ${isBawahTangga ? 'BAWAH TANGGA' : isWardrobe ? 'WARDROBE' : 'KITCHEN SET'}
Zona: ${zoneLabel}
${dimensionNote}
${budgetAnalysis}

TABEL HARGA RESMI (Gunakan untuk memberikan opsi variatif):
${resultList}

INSTRUKSI CERDAS:
1. Jika user memilih 1 material (misal: Semi Klasik), JANGAN tampilkan 3 opsi yang sama persis.
2. Tampilkan: 
   - Opsi Pilihan User (Semi Klasik)
   - Opsi Alternatif Lebih Murah (Minimalis)
   - Opsi Alternatif Lebih Mahal (Luxury/Premium)
3. Jika user punya budget tapi belum tau ukuran, gunakan "ANALISA BUDGET" di atas.
4. JANGAN HALUSINASI HARGA. Gunakan angka di tabel ini.
`;

}

/**
 * Build dynamic system prompt
 */
function buildEnhancedSystemPrompt(
    baseRules: string,
    ragContext: string,
    state: {
        location: string | null;
        zone: 'dalam_kota' | 'luar_kota' | null;
        quantity: number | null;
    },
    calculationGuidance: string = ""
): string {
    let zoneContext = "";

    if (state.zone) {
        const zoneInfo = getZoneInfo(state.zone);
        zoneContext = `
ZONA TERDETEKSI: ${formatZoneDisplay(state.zone)}
- Lokasi User: ${state.location || 'Tidak disebutkan'}
- Ambang Free Ongkir: ${formatRupiah(zoneInfo.freeShippingThreshold)}
- Biaya Ongkir (jika di bawah threshold): ${formatRupiah(zoneInfo.shippingFee)}
INSTRUKSI: Gunakan harga "${state.zone}" dari database untuk semua estimasi.
`;
    } else {
        zoneContext = `
ZONA BELUM TERDETEKSI: Lokasi user belum disebutkan.
INSTRUKSI: Tanyakan lokasi user terlebih dahulu sebelum memberikan estimasi harga.
Contoh: "Boleh tahu lokasinya di mana? Supaya saya bisa memberikan estimasi harga yang sesuai."
`;
    }

    const quantityContext = state.quantity
        ? `\nUKURAN TERDETEKSI: ${state.quantity} meter/m²\n`
        : "";

    return `
${baseRules}

=====================================================
KONTEKS SESI SAAT INI
=====================================================
${zoneContext}
${quantityContext}
${calculationGuidance}

KONTEKS DATABASE (Gunakan informasi ini sebagai acuan utama):
${ragContext ? ragContext : 'Tidak ada data spesifik dari database, gunakan pengetahuan umum interior standard.'}

REFERENSI TAMBAHAN:
- Garansi 12 Bulan
- Gratis Survey & Desain 3D (Area Bandung)
- pricing_source: "master_price_list_2025"
`;
}

/**
 * Wrapper untuk memanggil OpenRouter API dengan retry & model selection
 */
async function callOpenRouterAPI(
    messages: any[],
    apiKey: string,
    model: string
): Promise<any> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://homeputrainterior.com',
            'X-Title': 'Home Putra Interior Chatbot'
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 4096
        }),
    });

    if (!response.ok) {
        // Safe error parsing
        let errorMsg = `HTTP Error ${response.status}`;
        try {
            const errJson = await response.json();
            errorMsg = JSON.stringify(errJson);
        } catch {
            errorMsg = await response.text();
        }
        throw new Error(`OpenRouter API Error (${response.status}): ${errorMsg}`);
    }

    return response.json();
}

/**
 * Transformasi pesan untuk model yang tidak support system role (seperti Gemma)
 */
function transformMessagesForCompatibility(messages: any[]): any[] {
    const finalMessages = [...messages];
    const systemMessageIndex = finalMessages.findIndex(m => m.role === 'system');

    if (systemMessageIndex !== -1) {
        const systemContent = finalMessages[systemMessageIndex].content;
        finalMessages.splice(systemMessageIndex, 1); // remove system msg

        const firstUserIndex = finalMessages.findIndex(m => m.role === 'user');
        if (firstUserIndex !== -1) {
            finalMessages[firstUserIndex] = {
                ...finalMessages[firstUserIndex],
                content: `[SYSTEM INSTRUCTION]\n${systemContent}\n\n[USER REQUEST]\n${finalMessages[firstUserIndex].content}`
            };
        } else {
            finalMessages.unshift({ role: 'user', content: `[SYSTEM INSTRUCTION]\n${systemContent}` });
        }
    }
    return finalMessages;
}

// =====================================================
// SERVER ACTION UTAMA
// =====================================================

export async function chatWithAI(
    rawUserMessage: string,
    history: { role: string, text: string }[] = []
) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return { error: 'OpenRouter API Key Not Found' };

    // 1. Validasi Input
    const userMessage = sanitizeInput(rawUserMessage);
    if (!userMessage) return { error: 'Pesan tidak boleh kosong.' };

    try {
        const startTime = Date.now();

        // 2. Deteksi Konteks & Intent
        const intent = detectIntent(userMessage);

        let detectedLocation = extractLocation(userMessage);
        // Fallback: Check history reverse
        if (!detectedLocation) {
            for (let i = history.length - 1; i >= 0; i--) {
                const loc = extractLocation(history[i].text);
                if (loc) {
                    detectedLocation = loc;
                    break;
                }
            }
        }

        const detectedZone = detectedLocation ? detectZone(detectedLocation) : null;
        const detectedQuantity = extractQuantity(userMessage);

        const statePayload = {
            location: detectedLocation,
            zone: detectedZone,
            quantity: detectedQuantity
        };

        // 3. RAG Retrieval Strategy
        let ragContext = "";
        if (userMessage.length > 3) {
            const searchQuery = detectedZone
                ? `${userMessage} ${detectedZone}`
                : userMessage;
            ragContext = await searchPricing(searchQuery, 5);
        }

        // 4. Build System Rules
        const baseRules = await getSystemRules();

        // ADDED: Calculate Direct Estimation
        const isLuarKota = detectedZone === 'luar_kota';
        const estimationGuidance = calculateDirectEstimation(userMessage, detectedQuantity, isLuarKota);

        const systemPrompt = buildEnhancedSystemPrompt(
            baseRules,
            ragContext,
            statePayload,
            estimationGuidance
        );

        // 5. Construct Messages
        // Menyiapkan pesan tambahan berdasarkan intent
        let finalUserMessage = userMessage;
        if (intent.isOptionSelection) {
            finalUserMessage = `User memilih opsi ${userMessage}. 
PENTING: Lihat riwayat percakapan sebelumnya dan konfirmasi pilihan dengan menyebutkan:
1. Nama produk yang dibahas sebelumnya
2. Material dari opsi ${userMessage} yang sudah disebutkan
3. Harga PERSIS dari opsi ${userMessage} (zona: ${detectedZone || 'belum ditentukan'})
4. Sertakan format :::PRODUCT:{...}::: untuk visual card
JANGAN gunakan data lain selain yang sudah disebutkan.`;
        } else if (intent.isSurvey) {
            finalUserMessage = `${userMessage}\n\nUser tertarik booking survei. INSTRUKSI: Minta nama, nomor HP, dan alamat lengkap.`;
        } else if (intent.isEstimation && !detectedZone) {
            finalUserMessage = `${userMessage}\n\nCATATAN SISTEM: User meminta estimasi tapi lokasi belum diketahui. INSTRUKSI: Tanyakan lokasi user dulu.`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-10).map(msg => ({
                role: msg.role === 'model' ? 'assistant' : 'user',
                content: msg.text
            })),
            { role: 'user', content: finalUserMessage }
        ];

        // 6. Cek Cache Sebelum ke API
        const cacheKey = `${userMessage}_${detectedZone || 'unknown'}`;
        const cachedResult = aiResponseCache.get(cacheKey);

        if (cachedResult) {
            console.log('[Cache] Hit for:', cacheKey);
            return {
                success: cachedResult,
                latency: Date.now() - startTime,
                metadata: { ...statePayload, cached: true }
            };
        }

        // 7. Proses Pesan (Merge System Prompt)
        const compatMessages = transformMessagesForCompatibility(messages);

        // 8. Log Rate Limit Status
        const rlStatus = getRateLimitStatus();
        console.log(`[Rate Limit] Tokens: ${rlStatus.availableTokens}, Queue: ${rlStatus.queueLength}`);

        // 9. Execute API Call with Retry & Fallback
        const data = await retryWithBackoff(
            async () => {
                // PRIMARY MODEL EXECUTION
                const primaryModel = process.env.AI_MODEL || 'google/gemma-3-12b-it:free';
                try {
                    return await callOpenRouterAPI(compatMessages, apiKey, primaryModel);
                } catch (error: any) {
                    console.warn(`Primary model (${primaryModel}) failed:`, error.message);

                    // FALLBACK MODEL EXECUTION
                    // Jika primary gagal, coba model backup yang lebih ringan/cepat
                    const backupModel = 'google/gemma-3-4b-it:free';
                    if (primaryModel !== backupModel) {
                        console.info(`Switching to backup model: ${backupModel}`);
                        // Wait briefly before retry to prevent immediate storm
                        await new Promise(r => setTimeout(r, 1000));
                        return await callOpenRouterAPI(compatMessages, apiKey, backupModel);
                    }
                    throw error; // Re-throw if backup fail or same model
                }
            },
            {
                maxRetries: 3,
                initialDelay: 2000,
                maxDelay: 30000,
                onRetry: (attempt, error, nextDelay) => {
                    console.log(`[Retry ${attempt}] ${error.message}. Next in ${nextDelay}ms`);
                }
            }
        );

        // 10. Process Response
        const endTime = Date.now();
        let aiResponse = data.choices[0]?.message?.content || '';

        // Clean <think> blocks (DeepSeek style artifacts)
        const thinkMatch = aiResponse.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
            aiResponse = aiResponse.replace(thinkMatch[0], '').trim();
        }

        if (!aiResponse) {
            aiResponse = "Maaf, sistem sedang sibuk. Mohon coba lagi sesaat lagi.";
        }

        // 11. Extract & SAVE Lead Data
        let leadData = null;
        try {
            const leadMatch = aiResponse.match(/<lead_data>([\s\S]*?)<\/lead_data>/);
            if (leadMatch) {
                // CLEANUP: Hapus blok JSON dari pesan yang dilihat user
                aiResponse = aiResponse.replace(leadMatch[0], '').trim();

                leadData = JSON.parse(leadMatch[1].trim());

                // DATA PERSISTENCE: Save to JSON File
                await saveLeadToFile(leadData);
                console.log('[Lead Capture] Data saved successfully:', leadData.name);

                // FITUR WA AUTO-COMPLETE CHAT (CARD STYLE)
                // Fix Mapping Data (Handle variasi output LLM)
                const name = leadData.name || leadData.user_name || 'Pelanggan';
                const phone = leadData.phone || leadData.phone_number || '-';
                const address = leadData.address || leadData.location || '-';

                // Append Link WA di akhir respon
                const adminWa = "6282119799203";
                const product = leadData.product_interest || 'Interior Custom';
                const material = leadData.material_preference || 'Belum ditentukan';
                const qty = leadData.quantity ? `${leadData.quantity} Meter` : 'Belum diukur';
                const zone = leadData.zone ? (leadData.zone === 'luar_kota' ? 'Luar Kota' : 'Dalam Kota') : '-';
                const priceFormatted = leadData.estimated_price_raw ? `Rp ${new Intl.NumberFormat('id-ID').format(leadData.estimated_price_raw)}` : 'Menunggu Survei';

                const messageText = `Halo Admin Home Putra Interior 👋\nSaya ingin konfirmasi request survei & konsultasi dengan detail berikut:\n\n👤 DATA PEMESAN\n----------------\n• Nama: ${name}\n• No. HP: ${phone}\n• Lokasi: ${address} (Zona: ${zone})\n\n📦 DETAIL PROYEK\n----------------\n• Produk: ${product}\n• Material: ${material}\n• Estimasi Ukuran: ${qty}\n• Estimasi Budget: ${priceFormatted}\n\nMohon dijadwalkan untuk survei lokasi secepatnya. Terima kasih.`;
                const encodedMsg = encodeURIComponent(messageText);
                const waLink = `https://wa.me/${adminWa}?text=${encodedMsg}`;

                // Tampilan Card Visual (React Component)
                const cardData = {
                    name,
                    phone,
                    location: address,
                    product,
                    price: priceFormatted,
                    link: waLink
                };
                aiResponse += `\n\n:::WA_CARD:${JSON.stringify(cardData)}:::`;

                /* Tampilan Card ala Markdown (DEPRECATED)
                aiResponse += `
\n ---
### 🎫 KARTU ANTRIAN SURVEI
**Nama:** ${name}
**Kontak:** ${phone}
**Lokasi:** ${address}

[**� KLIK TOMBOL INI UNTUK LANJUT KE WHATSAPP**](${waLink})
*(Kirim pesan yang muncul otomatis di WA untuk booking jadwal)*
`; */
            }
        } catch (e) {
            console.error('[Lead Error] Failed to parse or save lead data:', e);
        }

        return {
            success: aiResponse,
            latency: endTime - startTime,
            metadata: { ...statePayload, leadData }
        };
    } catch (error: any) {
        console.error('Chat Action Fatal Error:', error);
        return {
            error: `Sistem Error: ${error.message || 'Unknown Server Error'}`,
            errorCode: 500
        };
    }
}

/**
 * Simpan Data Lead ke File JSON (Simple Database)
 */
async function saveLeadToFile(data: any) {
    try {
        const dataDir = path.join(process.cwd(), 'data');
        const filePath = path.join(dataDir, 'leads.json');

        // Ensure directory exists
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }

        // Read existing data
        let leads = [];
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            leads = JSON.parse(fileContent);
        } catch {
            // File not found or empty, start fresh
        }

        // Add new lead with Timestamp
        const newLead = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            source: 'chatbot_v1',
            ...data
        };

        leads.push(newLead);

        // Save back to file
        await fs.writeFile(filePath, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (err) {
        console.error("Critical Error saving lead:", err);
    }
}
