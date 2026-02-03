/**
 * =====================================================
 * AI-ASSISTANT.TSX - CONSTRUCT AI (IMAGE MATCH)
 * =====================================================
 * Design Reference: Light Mode, Split View
 * Left: Chat Interface
 * Right: Project Insights Panel (Budget, Timeline, Specs)
 * =====================================================
 */

'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import {
    Calculator, Scale, FileText,
    Send, Sparkles, Loader2, Copy,
    ArrowRightLeft, CheckCircle2,
    TrendingUp, ArrowRight, ArrowLeft, Plus,
    Paperclip, Mic, MoreHorizontal, History,
    LayoutDashboard, CheckSquare, Clock, Wallet, Box
} from 'lucide-react';
import { pricingData, getAllMaterials } from '../lib/pricing-data';
import { chatWithAI } from '../actions/chat';
import ProductCard from './ProductCard';

// =====================================================
// INTERFACES
// =====================================================

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    latency?: number;
    timestamp?: string;
}

// =====================================================
// COMPONENTS
// =====================================================

function ChatBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 1. Helper for Markdown Parsing (**bold** and *italic*)
    const parseFormatting = (text: string) => {
        // First split by bold (**text**)
        const parts = text.split(/(\*\*.*?\*\*|\*[^*]+\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                return <em key={index} className="italic text-amber-600 font-semibold">{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    // 2. Main Content Renderer (Product Cards + Text)
    const renderContent = (fullText: string) => {
        // Regex to find :::PRODUCT:{...}::: blocks (match any char including newlines)
        const parts = fullText.split(/(:::PRODUCT:[\s\S]*?:::)/g);

        return parts.map((part, index) => {
            // Check if this part is a Product Block
            if (part.startsWith(':::PRODUCT:') && part.endsWith(':::')) {
                let jsonString = part.replace(':::PRODUCT:', '').replace(':::', '').trim();
                // Clean markdown code blocks if present
                jsonString = jsonString.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
                return <ProductCard key={index} dataJSON={jsonString} />;
            }

            // Otherwise, render as text with formatting parsing
            return <span key={index}>{parseFormatting(part)}</span>;
        });
    };

    return (
        <div className={`flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? 'justify-end' : 'justify-start items-start gap-4'}`}>

            {/* AI Avatar */}
            {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-[#121212] flex items-center justify-center shrink-0 mt-1 shadow-md border border-gray-800">
                    <Sparkles size={18} className="text-[#FBBF24]" />
                </div>
            )}

            <div className={`
                relative px-4 py-3 rounded-2xl transition-all duration-300
                max-w-[90%] md:max-w-[80%] lg:max-w-[70%]
                ${isUser
                    ? 'bg-[#FBBF24] text-gray-900 shadow-md rounded-tr-sm font-medium'
                    : 'bg-[#F8F9FA] border border-gray-200/60 text-gray-800 shadow-sm rounded-tl-sm'
                }
            `}>
                <div className="text-base md:text-[17px] leading-relaxed md:leading-loose whitespace-pre-wrap break-words font-normal tracking-wide text-gray-700">
                    {renderContent(message.text)}

                    {/* Inline Timestamp (WhatsApp Style) */}
                    <span className={`inline-flex items-center gap-1 ml-2 align-bottom text-[10px] font-medium select-none ${isUser ? 'text-black/50' : 'text-gray-400'}`}>
                        {message.timestamp || 'Baru saja'}
                    </span>
                </div>

                {/* Copy Button for AI (Hidden until hover) */}
                {!isUser && (
                    <button
                        onClick={handleCopy}
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-[#F59E0B]"
                        title="Salin Teks"
                    >
                        {copied ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
                    </button>
                )}
            </div>
        </div>
    );
}

function LoadingBubble() {
    return (
        <div className="flex w-full justify-start items-start gap-3 mb-6 animate-enter">
            <div className="w-8 h-8 rounded-lg bg-[#121212] flex items-center justify-center shrink-0 mt-1">
                <Loader2 size={16} className="text-[#FBBF24] animate-spin" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm">
                <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </div>
            </div>
        </div>
    );
}

// =====================================================
// MAIN ASSISTANT
// =====================================================

export default function AIAssistant() {
    // STATE
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Auto-scroll
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Auto-focus on Key Press
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Ignore if already typing in an input/textarea
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                return;
            }

            // Ignore special keys (Ctrl, Alt, Meta, arrows, etc.)
            if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
                return;
            }

            // Focus textarea and let the event continue so the char is typed
            textareaRef.current?.focus();
        };

        window.addEventListener('keydown', handleGlobalKeyDown);

        // Also focus on mount
        setTimeout(() => textareaRef.current?.focus(), 100);

        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const handleSendMessage = async (e?: FormEvent, overrideInput?: string) => {
        e?.preventDefault();
        const textToSend = overrideInput || input;

        if (!textToSend.trim() || isLoading) return;

        // 1. User Message
        const userMsg: ChatMessage = {
            role: 'user',
            text: textToSend,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Or 'inherit'
        }

        setIsLoading(true);

        try {
            // 2. API Call
            const response = await chatWithAI(textToSend); // Server Action
            if (response.error) throw new Error(response.error);

            // 3. AI Response
            setMessages(prev => [...prev, {
                role: 'model',
                text: response.success || "No response.",
                latency: response.latency,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'model',
                text: "⚠️ Connection error. Please try again.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const QuickActionBase = ({ icon: Icon, title, desc, prompt }: any) => (
        <button
            onClick={() => handleSendMessage(undefined, prompt)}
            className="group p-3 md:p-4 bg-white border border-gray-200 hover:border-[#F59E0B] hover:shadow-md rounded-xl text-left transition-all duration-200 h-full flex flex-col justify-between"
        >
            <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                <div className="p-1.5 md:p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform shrinking-0">
                    <Icon size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <span className="font-bold text-gray-900 text-xs md:text-sm line-clamp-1">{title}</span>
            </div>
            <p className="text-[10px] md:text-xs text-gray-400 group-hover:text-gray-500 transition-colors line-clamp-2 leading-relaxed">{desc}</p>
        </button>
    );

    return (
        <div className="flex h-full w-full bg-white relative">

            {/* =====================================================
                LEFT COLUMN: CHAT INTERFACE
               ===================================================== */}
            <div className="flex-1 flex flex-col relative min-w-0">



                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 md:pb-6 bg-[#FFFFFF] relative custom-scrollbar">
                    {/* Grid Background Pattern */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.6] pointer-events-none"></div>

                    {messages.length === 0 ? (
                        // === WELCOME HERO SECTION ===
                        <div className="relative z-10 flex flex-col items-center justify-center h-full pb-10 px-4 animate-enter">

                            {/* Logo / Icon */}
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3 md:mb-5 transform rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer">
                                <Sparkles size={20} className="text-white md:w-6 md:h-6" />
                            </div>

                            {/* Text Content */}
                            <div className="text-center space-y-1 md:space-y-2 max-w-lg mb-6 md:mb-8">
                                <h1 className="text-lg md:text-2xl font-extrabold text-gray-900 tracking-tight">
                                    Halo, Selamat Datang!
                                </h1>
                                <p className="text-gray-500 text-xs md:text-sm leading-relaxed px-4">
                                    Saya <span className="font-bold text-gray-800">Asisten Interior</span>. Siap bantu estimasi harga & konsultasi.
                                </p>
                            </div>

                            {/* Quick Actions Grid */}
                            <div className="grid grid-cols-2 gap-2 md:gap-3 w-full max-w-xl">
                                <QuickActionBase
                                    icon={Calculator}
                                    title="Estimasi Harga"
                                    desc="Hitung biaya Kitchen Set & Furniture"
                                    prompt="Bantu saya hitung estimasi harga untuk Kitchen Set dan Flooring."
                                />
                                <QuickActionBase
                                    icon={Scale}
                                    title="Bandingkan Material"
                                    desc="Lihat perbandingan HPL, Duco, dll"
                                    prompt="Bandingkan kelebihan dan kekurangan HPL vs Duco."
                                />
                                <QuickActionBase
                                    icon={FileText}
                                    title="Buat Penawaran"
                                    desc="Draft proposal untuk klien"
                                    prompt="Buatkan draft penawaran harga untuk klien renovasi rumah."
                                />
                                <QuickActionBase
                                    icon={TrendingUp}
                                    title="Tren Desain"
                                    desc="Lihat apa yang populer saat ini"
                                    prompt="Apa tren desain interior yang sedang populer saat ini?"
                                />
                            </div>
                        </div>
                    ) : (
                        // === CHAT MESSAGES ===
                        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
                            {/* Date Divider */}
                            <div className="flex justify-center mb-8">
                                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-gray-200">
                                    Hari Ini
                                </span>
                            </div>

                            {messages.map((msg, idx) => (
                                <ChatBubble
                                    key={idx}
                                    message={msg}
                                />
                            ))}

                            {isLoading && <LoadingBubble />}
                            <div ref={chatEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="fixed bottom-0 left-0 right-0 md:static p-3 md:p-6 bg-transparent md:bg-white border-none md:border-t md:border-gray-100 z-20 shrink-0">
                    <div className="max-w-3xl mx-auto">
                        <form
                            onSubmit={(e) => handleSendMessage(e)}
                            className={`
                                relative bg-white border border-gray-200 shadow-sm transition-all duration-300 ease-in-out overflow-hidden
                                ${(input.length > 140) ? 'rounded-3xl' : 'rounded-[24px] md:rounded-[28px] px-1.5 py-1 md:px-2 flex items-end gap-1 md:gap-2'}
                                focus-within:ring-2 focus-within:ring-[#F59E0B]/50 focus-within:border-[#F59E0B]
                            `}
                        >
                            {/* === CONDITIONAL LAYOUT === */}

                            {/* MODE 1: COMPACT (Short Text) - Icons Inline */}
                            {!(input.length > 140) && (
                                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0 m-1 md:m-1 mb-1.5">
                                    <Plus size={20} className="md:w-6 md:h-6" />
                                </button>
                            )}

                            {/* TEXTAREA (Shared but styled differently) */}
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    // Auto-resize logic
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder={input.length === 0 ? "Ketik pesan Anda..." : ""}
                                rows={1}
                                className={`
                                    bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-sm md:text-base font-medium focus:ring-0 resize-none custom-scrollbar
                                    ${(input.length > 140)
                                        ? 'w-full px-4 pt-4 pb-14 min-h-[84px] max-h-60' // Box Mode
                                        : 'flex-1 py-3 px-0 min-h-[44px] md:min-h-[52px] leading-[20px] md:leading-[24px]' // Pill Mode (Flexible)
                                    }
                                `}
                            />

                            {/* MODE 1: RIGHT ACTIONS (Inline - Short Text) */}
                            {!(input.length > 140) && (
                                <div className="flex items-center gap-1 pr-1 mb-1.5">
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading}
                                        className={`
                                            w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm
                                            ${input.trim()
                                                ? 'bg-[#F59E0B] text-black hover:bg-[#D97706] hover:scale-105 shadow-md'
                                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        <ArrowRight size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
                                    </button>
                                </div>
                            )}

                            {/* MODE 2: BOX TOOLBAR (Long Text) */}
                            {(input.length > 140) && (
                                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-white/90 backdrop-blur-sm py-1 z-10 rounded-xl px-1 animate-in fade-in zoom-in duration-200">
                                    {/* Left: Attachments */}
                                    <div className="flex gap-1">
                                        <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-2">
                                        <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                            <Mic size={20} />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isLoading}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#F59E0B] text-black shadow-sm hover:bg-[#D97706] hover:scale-105 transition-all"
                                        >
                                            <ArrowRight size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}
