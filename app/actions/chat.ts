'use server';

import { searchPricing } from '../lib/rag';
import fs from 'fs';
import path from 'path';

/**
 * Server Action Utama untuk Chat AI
 * Fungsi ini menangani logika otak Chatbot:
 * 1. Menerima pesan user.
 * 2. Mencari data relevan di database (RAG).
 * 3. Membaca aturan kepribadian AI (System Prompt).
 * 4. Mengirimkan semuanya ke Groq AI untuk dijawab.
 * 
 * @param userMessage - Pesan dari pengguna
 * @param history - Riwayat percakapan sebelumnya
 */
export async function chatWithAI(userMessage: string, history: { role: string, text: string }[] = []) {
    // Ambil API Key (mendukung format server-side atau client-side env)
    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!apiKey) {
        return { error: 'API Key Not Found' };
    }

    try {
        // === LANGKAH 1: RAG (Pencarian Data) ===
        // Mencari 5 potongan informasi termirip dari database TiDB
        const ragContext = await searchPricing(userMessage, 5);

        // === LANGKAH 2: MEMUAT ATURAN AI (Persona) ===
        // Membaca file teks yang berisi gaya bicara dan aturan standar
        const rulesPath = path.join(process.cwd(), 'rag_data', 'ai_behavior_rules.txt');
        let baseRules = "";
        try {
            baseRules = fs.readFileSync(rulesPath, 'utf-8');
        } catch (e) {
            console.error("Gagal membaca file rules:", e);
            baseRules = "PERAN: Kamu adalah Sales Interior profesional.";
        }

        // Menyusun Instruksi Lengkap untuk AI
        const systemPrompt = `
${baseRules}

ATURAN PENTING:
1. BATASAN TOPIK: Kamu HANYA ahli dalam Interior Design, Kitchen Set, Wallpanel, dan Furniture Indoor (Lemari, TV Cabinet, dll).
2. TOLAK TOPIK LAIN: Jika user bertanya tentang "Outdoor Furniture", "Taman", "Kolam Renang", "Konstruksi Berat", atau topik non-interior lainnya, kamu HARUS MENOLAK dengan sopan. Contoh: "Maaf, saya spesialis interior dan tidak menyediakan layanan untuk outdoor/eksterior." JANGAN MENGARANG layanan yang tidak kami sediakan.

KONTEKS DATABASE (Gunakan informasi ini sebagai acuan utama):
${ragContext ? ragContext : 'Tidak ada data spesifik dari database, gunakan pengetahuan umum interior standard.'}

REFERENSI TAMBAHAN:
- Garansi 12 Bulan
- Gratis Survey & Desain 3D (Area Bandung)
`;

        // === LANGKAH 3: MENYIAPKAN PESAN ===
        // Mengambil 5 pesan terakhir agar hemat token tapi tetap nyambung
        const recentHistory = history.slice(-5).map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.text
        }));

        const messages = [
            { role: 'system', content: systemPrompt },
            ...recentHistory,
            { role: 'user', content: userMessage }
        ];

        // === LANGKAH 4: REQUEST KE GROQ CLOUD ===
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile', // Model Terbaru & Stabil
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return { result: data.choices[0]?.message?.content || 'Maaf, saya tidak mengerti.' };

    } catch (error: any) {
        console.error('AI Chat Error:', error);
        // Kembalikan pesan error yang jelas untuk debugging
        return { error: `Sistem Error: ${error.message}` };
    }
}
