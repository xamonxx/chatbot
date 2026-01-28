/**
 * =====================================================
 * AI-ASSISTANT.TSX - AI CONSULTANT MODERN UI
 * =====================================================
 * Design: Modern, User-Friendly, Dark Mode Support
 * Powered by: OpenRouter AI API
 * =====================================================
 */

'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import {
    MessageSquare, Calculator, Scale, FileText,
    Send, User, Sparkles, Loader2, Bot, Copy,
    ArrowRightLeft, CheckCircle2, AlertTriangle,
    Zap, TrendingUp, ArrowRight, PieChart, ArrowLeft, Plus
} from 'lucide-react';
import { pricingData, getAllMaterials, formatCurrency } from '../lib/pricing-data';

// =====================================================
// INTERFACES
// =====================================================

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

interface CalcData {
    clientName: string;
    region: 'dalam' | 'luar';
    kitchenLength: number;
    wallpanelType: string;
    wallpanelArea: number;
}

interface CompareData {
    item1: string;
    item2: string;
}

// =====================================================
// SUB COMPONENTS
// =====================================================

/**
 * Mode Tab Button - Tombol navigasi mode AI
 */
function ModeTab({
    active, onClick, icon, label, description, color
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    description: string;
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        amber: 'from-amber-500 to-orange-500 shadow-amber-500/30',
        purple: 'from-purple-500 to-pink-500 shadow-purple-500/30',
        blue: 'from-blue-500 to-cyan-500 shadow-blue-500/30',
        green: 'from-green-500 to-emerald-500 shadow-green-500/30',
    };

    return (
        <button
            onClick={onClick}
            className={`
                shrink-0 relative group overflow-hidden
                p-3 md:p-4 rounded-xl transition-all duration-300 text-left w-[140px] md:w-auto md:flex-1
                border
                ${active
                    ? `bg-gradient-to-br ${colorClasses[color]} text-white border-transparent shadow-lg scale-[1.02] ring-2 ring-offset-2 ring-transparent dark:ring-offset-slate-900`
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }
            `}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform'}`}>
                    {icon}
                </div>
                <div>
                    <p className="font-bold text-sm md:text-base leading-tight">{label}</p>
                    <p className={`text-[10px] md:text-xs mt-0.5 ${active ? 'text-white/90' : 'text-slate-400'}`}>
                        {description}
                    </p>
                </div>
            </div>

            {/* Active Indicator Dot */}
            {active && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse" />
            )}
        </button>
    );
}

/**
 * Chat Bubble - Bubble pesan dengan styling modern
 */
function ChatBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';
    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`
                flex max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm md:shadow-md relative group
                ${isUser
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-100 dark:border-slate-700'
                }
            `}>
                <p className={`text-base md:text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'font-medium' : ''}`}>
                    {message.text}
                </p>

                {/* Time Indicator (Mock) -> Bisa di dynamic nanti */}
                <span className={`text-[10px] absolute bottom-1 ${isUser ? 'right-2 text-amber-100' : 'right-3 text-slate-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Just now
                </span>
            </div>
        </div>
    );
}

// Komponen Loading Bubble
function LoadingBubble({ retryCount }: { retryCount: number }) {
    return (
        <div className="flex w-full justify-start mb-4 animate-fade-in-up">
            <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-2 min-w-[120px]">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium ml-1">Ngetik...</span>
                </div>
                {retryCount > 0 && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                        Mencoba alternatif server ({retryCount})...
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * Quick Prompt Button - Tombol prompt cepat
 */
function QuickPromptButton({ onClick, label, icon }: { onClick: () => void; label: string; icon?: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="shrink-0 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm font-medium hover:shadow-md hover:scale-105 transition-all flex items-center gap-2"
        >
            {icon}
            {label}
        </button>
    );
}

/**
 * Input Field dengan label modern
 */
function InputField({
    label, value, onChange, placeholder, type = 'text', icon
}: {
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                {icon}
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            />
        </div>
    );
}

/**
 * Select Field dengan styling modern
 */
function SelectField({
    label, value, onChange, options, icon
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    icon?: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                {icon}
                {label}
            </label>
            <select
                value={value}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

/**
 * Result Card - Kartu hasil AI
 */
function ResultCard({
    title, content, icon, onCopy, copied
}: {
    title: string;
    content: string;
    icon: React.ReactNode;
    onCopy?: () => void;
    copied?: boolean;
}) {
    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                        {icon}
                    </div>
                    <h3 className="font-bold text-amber-800 dark:text-amber-300">{title}</h3>
                </div>
                {onCopy && (
                    <button
                        onClick={onCopy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-50 dark:hover:bg-slate-600 transition-all"
                    >
                        {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                )}
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{content}</p>
            </div>
        </div>
    );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AIAssistant() {
    // === STATE ===
    const [aiMode, setAiMode] = useState<'chat' | 'calculator' | 'comparison' | 'proposal'>('chat');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

    const [calcData, setCalcData] = useState<CalcData>({
        clientName: '',
        region: 'luar',
        kitchenLength: 0,
        wallpanelType: 'Minimalis',
        wallpanelArea: 0
    });

    const [compareData, setCompareData] = useState<CompareData>({
        item1: '',
        item2: ''
    });

    const [calcResult, setCalcResult] = useState('');
    const [proposalResult, setProposalResult] = useState('');
    const [compareResult, setCompareResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

    // === EFFECTS ===
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // === API CALL (GROQ EDITION) ===
    const callAI = async (prompt: string): Promise<string> => {
        if (!apiKey) {
            return '⚠️ API Key belum dikonfigurasi. Silakan tambahkan NEXT_PUBLIC_OPENROUTER_API_KEY di file .env.local';
        }

        // Daftar model GROQ (Super Cepat):
        const models = [
            'llama-3.3-70b-versatile',  // Tier 1: Paling Pintar & Versatile
            'llama-3.1-8b-instant',     // Tier 2: Super Cepat (Instant)
            'mixtral-8x7b-32768',       // Tier 3: Stabil & Context Besar
            'gemma2-9b-it'              // Tier 4: Google Model
        ];

        let lastError = '';

        for (const model of models) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7,
                        max_tokens: 1500
                    }),
                });

                if (!response.ok) {
                    const errorJson = await response.json().catch(() => ({}));
                    const errorMessage = errorJson.error?.message || response.statusText;

                    if (response.status === 404) {
                        console.warn(`[Groq] Model ${model} not found. Skipping...`);
                        continue;
                    }

                    console.warn(`[Groq Fail] ${model}: ${response.status} - ${errorMessage}`);
                    lastError = `${response.status} - ${errorMessage}`;
                    setRetryCount(prev => prev + 1);
                    continue;
                }

                const data = await response.json();
                const result = data.choices?.[0]?.message?.content;

                if (result) return result;

            } catch (error) {
                console.error(`[Groq Error] Connection to ${model}:`, error);
                lastError = error instanceof Error ? error.message : 'Network Error';
            }
        }

        return `❌ Gagal terhubung ke Groq AI.\nDetail Error: ${lastError}\n\nPastikan API Key Groq Anda valid dan kuota mencukupi. 🙏`;
    };

    // === HANDLERS ===
    const handleSendMessage = async (e?: FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = chatInput;
        setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
        setChatInput('');
        setIsLoading(true);
        setRetryCount(0);

        const systemPrompt = `
            PERAN: Kamu adalah "Sarah", Konsultan Interior CS dari Home Putra Interior Bandung yang ramah dan membantu.
            
            GAYA BICARA:
            - Gunakan Bahasa Indonesia yang natural, luwes, dan percakapan sehari-hari.
            - Posisikan diri sebagai teman yang ahli interior.
            - HINDARI simbol-simbol rumit (seperti **, ##, [], dll). Gunakan teks biasa yang rapi.
            - Gunakan emoji secukupnya untuk kesan ramah (😊, 🙏, ✨).
            - Jika menyebut harga, gunakan format "Rp X juta" atau "Rp X.XXX.XXX".
            
            KONTEKS DATA HARGA: ${JSON.stringify(pricingData)}
            
            ATURAN PENTING:
            1. Jika user tanya harga, jawab dengan santai: "Untuk Kitchen Set Aluminium harganya Rp 3,5 juta per meter ya Kak..."
            2. Selalu cek status biaya charge (Min Order):
               - Dalam Kota: Order < 15 Juta kena charge 500rb.
               - Luar Kota: Order < 20 Juta kena charge 1 Juta.
            3. Jika hitungan user kena charge, berikan saran cerdas: "Sayang banget lho Kak kalau kena charge, mending tambah WPC Panel dikit lagi..."
            4. Jangan berikan jawaban terlalu panjang. To the point tapi manis.
        `;

        const reply = await callAI(systemPrompt + '\n\nPertanyaan Customer: ' + userMessage);
        setChatHistory(prev => [...prev, { role: 'model', text: reply }]);
        setIsLoading(false);
    };

    const handleCalculate = async () => {
        setIsLoading(true);
        setRetryCount(0);
        const prompt = `
            Bertindaklah sebagai konsultan yang sedang menghitungkan budget klien.
            Jangan berikan output tabel kaku. Berikan penjelasan naratif yang enak dibaca.
            
            DATA PROYEK:
            - Lokasi: ${calcData.region === 'dalam' ? 'Dalam Kota (Bandung/Jatim)' : 'Luar Kota (Jabodetabek/Pantura)'}
            - Kitchen Set: ${calcData.kitchenLength} meter
            - Wallpanel: ${calcData.wallpanelType} seluas ${calcData.wallpanelArea} m²
            
            DATA HARGA: ${JSON.stringify(pricingData)}
            
            TUGAS:
            1. Hitung total biaya secara rinci tapi santai.
            2. Cek apakah kena Charge Minimum Order (Dalam Kota < 15jt, Luar Kota < 20jt).
            3. Berikan kesimpulan total bersih.
            
            CONTOH OUTPUT:
            "Oke Kak, saya hitungkan ya untuk proyek di [Lokasi]...
            
            Untuk Kitchen Set sepanjang X meter, biayanya sekitar Rp X.
            Lalu untuk Wallpanel-nya totalnya Rp Y.
            
            Nah, karena total belanja Kakak masih di bawah Rp 20 juta, ada biaya tambahan (charge) sebesar Rp 1 juta ya Kak. 
            
            Saran saya: Daripada bayar charge cuma-cuma, mending uangnya dipakai buat nambah aksesoris atau cermin, jadi dapat barang dan bebas ongkir deh! 😊
            
            Total Estimasi Akhir: Rp Z"
        `;
        const result = await callAI(prompt);
        setCalcResult(result);
        setIsLoading(false);
    };

    const handleGenerateProposal = async () => {
        setIsLoading(true);
        setRetryCount(0);
        const prompt = `
            Buatkan draft pesan WhatsApp (Copywriting) yang sopan, rapi, dan menarik untuk dikirim ke klien.
            Jangan gunakan format Markdown tebal/miring. Gunakan format text biasa.
            
            UNTUK KLIEN: ${calcData.clientName || 'Bapak/Ibu'}
            DETAIL:
            - Lokasi: ${calcData.region === 'dalam' ? 'Dalam Kota' : 'Luar Kota'}
            - Kitchen Set: ${calcData.kitchenLength}m
            - Wallpanel ${calcData.wallpanelType}: ${calcData.wallpanelArea}m²
            
            DATA HARGA: ${JSON.stringify(pricingData)}
            
            GUIDE:
            - Buka dengan salam hangat.
            - Rincian harga yang jelas.
            - Total akhir.
            - Closing statement yang mengajak diskusi.
            - Gunakan emoji WhatsApp yang pas.
        `;
        const result = await callAI(prompt);
        setProposalResult(result);
        setIsLoading(false);
    };

    const handleCompare = async () => {
        if (!compareData.item1 || !compareData.item2) return;
        setIsLoading(true);
        setRetryCount(0);
        const prompt = `
            Jelaskan perbandingan antara "${compareData.item1}" vs "${compareData.item2}" selayaknya kamu menjelaskan ke teman awam.
            
            DATA: ${JSON.stringify(pricingData)}
            
            JANGAN PAKAI TABEL. Gunakan poin-poin penjelasan santai.
            Bahas aspek: Harga, Keawetan, dan Penampilan.
            
            Contoh gaya bicara:
            "Kalau Kitchen Set Aluminium itu memang harganya lebih tinggi Kak, tapi dia juara banget soal keawetan, anti rayap selamanya.
            Nah, kalau Multipleks harganya lebih hemat dan pilihan warnanya banyak banget, tapi tetap harus hati-hati sama lembab ya..."
            
            Berikan rekomendasi akhir: "Kalau budget masuk, saya sarankan ambil yang X karena..."
        `;
        const result = await callAI(prompt);
        setCompareResult(result);
        setIsLoading(false);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const materials = getAllMaterials();

    // === RENDER ===
    return (
        // Container Utama: h-full untuk mengisi parent
        <div className="relative h-full w-full flex flex-col bg-slate-900 overflow-hidden md:rounded-2xl md:border md:border-slate-700">

            {/* Mode Selection Removed - Moved to + Menu */}

            {/* Content Area - Full height, hidden overflow */}
            <div className="flex-1 overflow-hidden min-h-0 relative">

                {/* MODE: CHAT */}
                {aiMode === 'chat' && (
                    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-slate-800 to-slate-950">

                        {/* === WALLPAPER EFFECT DEWA === */}
                        {/* Pattern Plus Signs Putih (Premium Dark Look) */}
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                backgroundSize: '60px 60px'
                            }}
                        />

                        {/* Messages Area - Scrollable dengan padding untuk input */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-5 scroll-smooth relative z-10 pb-48 overscroll-contain touch-pan-y chat-scrollbar">

                            {/* Welcome Screen - Gemini Style */}
                            {chatHistory.length === 0 && (
                                <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] px-6 py-12 animate-fade-in-up">

                                    {/* Greeting with Icon */}
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                                            <Sparkles size={18} className="text-white" />
                                        </div>
                                        <span className="text-slate-400 text-lg font-medium">Halo, Selamat datang!</span>
                                    </div>

                                    {/* Hero Text - Large Gradient */}
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-tight md:leading-snug max-w-3xl">
                                        <span className="bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 bg-clip-text text-transparent">
                                            Saya siap membantu Anda dengan{' '}
                                        </span>
                                        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                                            estimasi harga, perbandingan material,
                                        </span>
                                        <span className="bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 bg-clip-text text-transparent">
                                            {' '}dan banyak lagi.
                                        </span>
                                    </h1>

                                    {/* Subtitle */}
                                    <p className="mt-6 text-slate-500 text-center text-sm md:text-base max-w-md">
                                        Virtual Assistant Home Putra Interior — Siap konsultasi 24/7 😊
                                    </p>

                                </div>
                            )}

                            {chatHistory.map((msg, idx) => (
                                <ChatBubble key={idx} message={msg} />
                            ))}

                            {isLoading && <LoadingBubble retryCount={retryCount} />}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area - Absolute positioned at bottom with mobile keyboard spacing */}
                        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pt-6 pb-10 md:pb-4 flex flex-col gap-3">

                            {/* Gradient Fade Background - Extended untuk cover quick prompts */}
                            <div className="absolute inset-x-0 bottom-0 top-[-80px] bg-gradient-to-t from-slate-900 via-slate-900/98 to-transparent -z-10 pointer-events-none" />

                            {/* QUICK PROMPTS (MELAYANG DI ATAS INPUT) */}
                            <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar px-1">
                                <QuickPromptButton
                                    onClick={() => setChatInput("Berapa estimasi harga kitchen set leter L ukuran 3x2 meter?")}
                                    label="Kitchen Leter L"
                                    icon={<Zap size={13} />}
                                />
                                <QuickPromptButton
                                    onClick={() => setChatInput("Apa bedanya bahan plywood vs PVC board?")}
                                    label="Beda Bahan"
                                    icon={<AlertTriangle size={13} />}
                                />
                                <QuickPromptButton
                                    onClick={() => setChatInput("Hitung biaya wallpanel kisi-kisi ukuran 3x3 meter")}
                                    label="Hitung Wallpanel"
                                    icon={<TrendingUp size={13} />}
                                />
                            </div>

                            <form
                                onSubmit={handleSendMessage}
                                className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 pl-3 rounded-[32px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 relative z-20"
                            >
                                {/* PLUS MENU POPUP */}
                                {showMenu && (
                                    <div className="absolute bottom-16 left-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up z-50 origin-bottom-left">
                                        <div className="p-2 space-y-1">
                                            <button type="button" onClick={() => { setAiMode('calculator'); setShowMenu(false); }} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group">
                                                <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 group-hover:scale-110 transition-transform"><Calculator size={18} /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Calculator</p>
                                                    <p className="text-[10px] text-slate-500">Hitung budget kitchen</p>
                                                </div>
                                            </button>
                                            <button type="button" onClick={() => { setAiMode('comparison'); setShowMenu(false); }} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group">
                                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:scale-110 transition-transform"><Scale size={18} /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Comparison</p>
                                                    <p className="text-[10px] text-slate-500">Bandingkan material</p>
                                                </div>
                                            </button>
                                            <button type="button" onClick={() => { setAiMode('proposal'); setShowMenu(false); }} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group">
                                                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 group-hover:scale-110 transition-transform"><FileText size={18} /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Proposal</p>
                                                    <p className="text-[10px] text-slate-500">Buat penawaran WA</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Tombol Plus (Toggle Menu) */}
                                <button
                                    type="button"
                                    onClick={() => setShowMenu(!showMenu)}
                                    className={`p-2 rounded-full transition-all duration-300 shrink-0 ${showMenu ? 'bg-slate-200 dark:bg-slate-600 rotate-45' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                >
                                    <Plus size={20} className={showMenu ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'} />
                                </button>

                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Tanyakan apa saja..."
                                    className="flex-1 bg-transparent border-none text-base text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-0 focus:outline-none min-h-[44px]"
                                    disabled={isLoading}
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading || !chatInput.trim()}
                                    className={`
                                        h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                                        ${chatInput.trim()
                                            ? 'bg-amber-500 text-white shadow-md transform scale-100'
                                            : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 opacity-50'
                                        }
                                    `}
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                                </button>
                            </form>

                            <p className="text-[10px] text-center text-slate-400 dark:text-slate-600 font-medium opacity-70">
                                AI Consultant Home Putra Interior
                            </p>
                        </div>
                    </div>
                )}

                {/* MODE: CALCULATOR */}
                {
                    aiMode === 'calculator' && (
                        <div className="p-4 md:p-6 overflow-y-auto h-full bg-slate-50 dark:bg-slate-900 space-y-6 pb-24">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setAiMode('chat')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                        <Calculator size={20} className="text-purple-500" />
                                        Smart Budget Calculator
                                    </h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <SelectField
                                        label="Lokasi Proyek"
                                        value={calcData.region}
                                        onChange={(e) => setCalcData({ ...calcData, region: e.target.value as 'dalam' | 'luar' })}
                                        options={[
                                            { value: 'dalam', label: '📍 Dalam Kota (Bandung/Jatim)' },
                                            { value: 'luar', label: '🚚 Luar Kota (Jabodetabek/Pantura)' }
                                        ]}
                                    />
                                    <InputField
                                        label="Panjang Kitchen Set"
                                        type="number"
                                        value={calcData.kitchenLength || ''}
                                        onChange={(e) => setCalcData({ ...calcData, kitchenLength: Number(e.target.value) })}
                                        placeholder="Contoh: 3"
                                    />
                                    <SelectField
                                        label="Tipe Wallpanel"
                                        value={calcData.wallpanelType}
                                        onChange={(e) => setCalcData({ ...calcData, wallpanelType: e.target.value })}
                                        options={[
                                            { value: 'Minimalis', label: 'Wallpanel Minimalis' },
                                            { value: 'Semi Klasik', label: 'Wallpanel Semi Klasik' },
                                            { value: 'Klasik', label: 'Wallpanel Klasik' },
                                            { value: 'WPC', label: 'WPC Panel' }
                                        ]}
                                    />
                                    <InputField
                                        label="Luas Wallpanel (m²)"
                                        type="number"
                                        value={calcData.wallpanelArea || ''}
                                        onChange={(e) => setCalcData({ ...calcData, wallpanelArea: Number(e.target.value) })}
                                        placeholder="Contoh: 5"
                                    />
                                </div>

                                <button
                                    onClick={handleCalculate}
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                    {isLoading ? 'Menghitung...' : 'Hitung dengan AI'}
                                </button>
                            </div>

                            {calcResult && (
                                <ResultCard
                                    title="Hasil Kalkulasi"
                                    content={calcResult}
                                    icon={<TrendingUp size={18} className="text-white" />}
                                />
                            )}
                        </div>
                    )
                }

                {/* MODE: COMPARISON */}
                {
                    aiMode === 'comparison' && (
                        <div className="p-4 md:p-6 overflow-y-auto h-full bg-slate-50 dark:bg-slate-900 space-y-6 pb-24">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setAiMode('chat')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                        <Scale size={20} className="text-blue-500" />
                                        Material Battle
                                    </h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <SelectField
                                        label="Material 1"
                                        value={compareData.item1}
                                        onChange={(e) => setCompareData({ ...compareData, item1: e.target.value })}
                                        options={[
                                            { value: '', label: 'Pilih material...' },
                                            ...materials.map(m => ({ value: m, label: m }))
                                        ]}
                                    />
                                    <SelectField
                                        label="Material 2"
                                        value={compareData.item2}
                                        onChange={(e) => setCompareData({ ...compareData, item2: e.target.value })}
                                        options={[
                                            { value: '', label: 'Pilih material...' },
                                            ...materials.map(m => ({ value: m, label: m }))
                                        ]}
                                    />
                                </div>

                                <button
                                    onClick={handleCompare}
                                    disabled={isLoading || !compareData.item1 || !compareData.item2}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRightLeft size={18} />}
                                    {isLoading ? 'Membandingkan...' : 'Bandingkan Sekarang'}
                                </button>
                            </div>

                            {compareResult && (
                                <ResultCard
                                    title="Hasil Perbandingan"
                                    content={compareResult}
                                    icon={<Scale size={18} className="text-white" />}
                                />
                            )}
                        </div>
                    )
                }

                {/* MODE: PROPOSAL */}
                {
                    aiMode === 'proposal' && (
                        <div className="p-4 md:p-6 overflow-y-auto h-full bg-slate-50 dark:bg-slate-900 space-y-6 pb-24">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setAiMode('chat')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                        <FileText size={20} className="text-green-500" />
                                        WhatsApp Proposal Generator
                                    </h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField
                                        label="Nama Klien"
                                        value={calcData.clientName}
                                        onChange={(e) => setCalcData({ ...calcData, clientName: e.target.value })}
                                        placeholder="Bapak/Ibu..."
                                    />
                                    <SelectField
                                        label="Lokasi"
                                        value={calcData.region}
                                        onChange={(e) => setCalcData({ ...calcData, region: e.target.value as 'dalam' | 'luar' })}
                                        options={[
                                            { value: 'dalam', label: '📍 Dalam Kota' },
                                            { value: 'luar', label: '🚚 Luar Kota' }
                                        ]}
                                    />
                                    <InputField
                                        label="Panjang Kitchen (m)"
                                        type="number"
                                        value={calcData.kitchenLength || ''}
                                        onChange={(e) => setCalcData({ ...calcData, kitchenLength: Number(e.target.value) })}
                                        placeholder="3"
                                    />
                                    <InputField
                                        label="Luas Wallpanel (m²)"
                                        type="number"
                                        value={calcData.wallpanelArea || ''}
                                        onChange={(e) => setCalcData({ ...calcData, wallpanelArea: Number(e.target.value) })}
                                        placeholder="5"
                                    />
                                </div>

                                <button
                                    onClick={handleGenerateProposal}
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                    {isLoading ? 'Generating...' : 'Generate Proposal'}
                                </button>
                            </div>

                            {proposalResult && (
                                <ResultCard
                                    title="Proposal WhatsApp"
                                    content={proposalResult}
                                    icon={<FileText size={18} className="text-white" />}
                                    onCopy={() => copyToClipboard(proposalResult)}
                                    copied={copied}
                                />
                            )}
                        </div>
                    )
                }
            </div >
        </div >
    );
}
