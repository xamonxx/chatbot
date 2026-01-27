/**
 * =====================================================
 * RULES-PANEL.TSX - KOMPONEN PANEL ATURAN MODERN
 * =====================================================
 * Redesign: Card-based, Modern, Dark Mode Only
 * =====================================================
 */

'use client';

import { RuleItem, formatCurrency } from '../lib/pricing-data';
import {
    AlertCircle, CheckCircle, Lightbulb, Info, Wallet, TrendingUp, Shield, FileText, MapPin, Truck
} from 'lucide-react';

interface RulesPanelProps {
    rules: RuleItem[];
}

/**
 * Card untuk setiap rule
 */
function RuleCard({ rule, index }: { rule: RuleItem; index: number }) {
    const hasCharge = rule.costIn > 0 || rule.costOut > 0;

    return (
        <div
            className={`
                group relative overflow-hidden rounded-2xl border transition-all duration-300
                hover:scale-[1.01] hover:shadow-xl
                ${hasCharge
                    ? 'bg-gradient-to-br from-red-900/30 to-orange-900/20 border-red-700/50 hover:border-red-500/50'
                    : 'bg-gradient-to-br from-emerald-900/30 to-green-900/20 border-emerald-700/50 hover:border-emerald-500/50'
                }
            `}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="relative p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    <div className={`
                        shrink-0 p-2.5 rounded-xl shadow-lg
                        ${hasCharge
                            ? 'bg-gradient-to-br from-red-500 to-orange-500'
                            : 'bg-gradient-to-br from-emerald-500 to-green-500'
                        }
                    `}>
                        {hasCharge
                            ? <AlertCircle size={20} className="text-white" />
                            : <CheckCircle size={20} className="text-white" />
                        }
                    </div>

                    <div className="flex-1">
                        <h3 className={`font-bold text-lg ${hasCharge ? 'text-red-400' : 'text-emerald-400'}`}>
                            {rule.title}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                            {rule.detail}
                        </p>
                    </div>
                </div>

                {/* Impact Badge */}
                <div className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4
                    ${hasCharge
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }
                `}>
                    {hasCharge ? <AlertCircle size={12} /> : <Shield size={12} />}
                    {rule.impact}
                </div>

                {/* Price Grid */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/50">
                    {/* Dalam Kota */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-2">
                            <MapPin size={12} className="text-emerald-400" />
                            Dalam Kota
                        </div>
                        <span className={`
                            font-mono font-bold text-base px-3 py-1.5 rounded-lg inline-block
                            ${rule.costIn > 0
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }
                        `}>
                            {rule.costIn > 0 ? formatCurrency(rule.costIn) : '✓ GRATIS'}
                        </span>
                    </div>

                    {/* Luar Kota */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-2">
                            <Truck size={12} className="text-amber-400" />
                            Luar Kota
                        </div>
                        <span className={`
                            font-mono font-bold text-base px-3 py-1.5 rounded-lg inline-block
                            ${rule.costOut > 0
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }
                        `}>
                            {rule.costOut > 0 ? formatCurrency(rule.costOut) : '✓ GRATIS'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Main Component
 */
export default function RulesPanel({ rules }: RulesPanelProps) {
    return (
        <div className="space-y-6">

            {/* Section Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-700/50">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                    <FileText size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">
                        Syarat & Ketentuan
                    </h2>
                    <p className="text-sm text-slate-400">
                        {rules.length} ketentuan • Pahami sebelum order
                    </p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-amber-900/20 rounded-xl border border-amber-700/50">
                <Info size={20} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                    <strong className="text-amber-400">Penting:</strong> Biaya charge berlaku jika total order di bawah minimum. Pastikan cek sebelum finalisasi order.
                </p>
            </div>

            {/* Rules Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {rules.map((rule, idx) => (
                    <RuleCard key={idx} rule={rule} index={idx} />
                ))}
            </div>

            {/* Tips Box */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />

                {/* Decorative blurs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />

                <div className="relative p-6">
                    {/* Tips Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-xl">
                            <Lightbulb size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-amber-400">💡 Tips Bebas Charge</h3>
                            <p className="text-slate-400 text-sm">Strategi hemat untuk mengoptimalkan budget</p>
                        </div>
                    </div>

                    {/* Tips List */}
                    <div className="space-y-3">
                        <div className="flex gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="shrink-0 w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center font-bold text-amber-400">1</div>
                            <div>
                                <p className="font-medium text-white">Bundling Order</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    Gabungkan beberapa item dalam satu order agar total mencapai minimum.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="shrink-0 w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center font-bold text-amber-400">2</div>
                            <div>
                                <p className="font-medium text-white">Tambah Item Kecil</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    Lebih hemat tambah WPC Panel 2m² (<span className="text-amber-400">Rp 1.9jt</span>) daripada bayar charge <span className="text-red-400">Rp 1jt</span>.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="shrink-0 w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center font-bold text-amber-400">3</div>
                            <div>
                                <p className="font-medium text-white">Gunakan AI Consultant</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    Manfaatkan fitur <span className="text-amber-400 font-medium">Smart Calculator</span> untuk rekomendasi optimasi.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Savings Badge */}
                    <div className="mt-6 p-4 bg-emerald-900/20 rounded-xl flex items-center gap-4 border border-emerald-700/50">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Wallet size={24} className="text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-emerald-400">Hemat Sampai Rp 1.000.000</p>
                            <p className="text-sm text-slate-400">Dengan strategi yang tepat! 🎯</p>
                        </div>
                        <TrendingUp size={24} className="text-emerald-400" />
                    </div>
                </div>
            </div>

            {/* CTA Footer */}
            <div className="text-center p-6 bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-2xl border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-2">
                    Masih bingung dengan ketentuan?
                </p>
                <p className="text-white font-medium">
                    Tanyakan ke <span className="text-amber-400 font-bold">AI Chat</span> untuk penjelasan detail! 💬
                </p>
            </div>
        </div>
    );
}
