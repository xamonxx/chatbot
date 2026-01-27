/**
 * =====================================================
 * PRICE-TABLE.TSX - KOMPONEN TABEL HARGA MODERN
 * =====================================================
 * Redesign: Card-based, Modern, Dark Mode Only
 * =====================================================
 */

'use client';

import { PriceItem, formatCurrency, calculateDifference } from '../lib/pricing-data';
import {
    TrendingUp, TrendingDown, Minus, Info, Sparkles,
    CheckCircle, MapPin, Truck, Tag, ChefHat, LayoutDashboard
} from 'lucide-react';

interface PriceTableProps {
    items: PriceItem[];
    type: 'kitchen' | 'wallpanel';
}

/**
 * Badge untuk menampilkan selisih harga
 */
function DifferenceBadge({ priceIn, priceOut }: { priceIn: number; priceOut: number }) {
    const result = calculateDifference(priceIn, priceOut);

    if (result.isSame || result.diff === 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <Minus size={12} />
                Harga Sama
            </span>
        );
    }

    if (result.diff > 0) {
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                <TrendingUp size={12} />
                +{result.percent}%
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
            <TrendingDown size={12} />
            {result.percent}%
        </span>
    );
}

/**
 * Card Item untuk setiap produk
 */
function PriceCard({ item, index }: { item: PriceItem; index: number }) {
    const result = calculateDifference(item.priceIn, item.priceOut);

    return (
        <div
            className="group relative bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Gradient accent on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative p-5">
                {/* Header: Item Name & Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                            {item.item}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                            {item.spec}
                        </p>
                    </div>
                    <DifferenceBadge priceIn={item.priceIn} priceOut={item.priceOut} />
                </div>

                {/* Price Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Dalam Kota */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-2">
                            <MapPin size={12} className="text-emerald-400" />
                            Dalam Kota
                        </div>
                        <div className="text-xl font-bold text-white">
                            {formatCurrency(item.priceIn)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            per {item.unit}
                        </div>
                    </div>

                    {/* Luar Kota */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-2">
                            <Truck size={12} className="text-amber-400" />
                            Luar Kota
                        </div>
                        <div className="text-xl font-bold text-white">
                            {formatCurrency(item.priceOut)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            per {item.unit}
                        </div>
                    </div>
                </div>

                {/* Selisih Info */}
                {!result.isSame && result.diff !== 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 rounded-lg px-3 py-2">
                        <Info size={12} className="text-amber-400" />
                        <span>
                            Selisih <span className="text-amber-400 font-semibold">{formatCurrency(Math.abs(result.diff))}</span> antara dalam & luar kota
                        </span>
                    </div>
                )}

                {/* Note jika ada */}
                {item.note && (
                    <div className="mt-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex gap-2 items-start">
                        <Tag size={14} className="shrink-0 text-amber-400 mt-0.5" />
                        <span className="text-sm text-amber-200/80">{item.note}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Main Component
 */
export default function PriceTable({ items, type }: PriceTableProps) {
    const isKitchen = type === 'kitchen';
    const Icon = isKitchen ? ChefHat : LayoutDashboard;

    return (
        <div className="space-y-6">

            {/* Section Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-700/50">
                <div className={`p-3 rounded-2xl ${isKitchen
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                    : 'bg-gradient-to-br from-orange-500 to-rose-600'
                    } shadow-lg`}>
                    <Icon size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">
                        {isKitchen ? 'Kitchen Set' : 'Wallpanel & Decor'}
                    </h2>
                    <p className="text-sm text-slate-400">
                        {items.length} item • Harga per unit sudah termasuk pemasangan
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                        <MapPin size={14} />
                        <span className="font-medium">Dalam Kota</span>
                    </div>
                    <span className="text-slate-500">= Bandung, Cimahi, Soreang</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-amber-400">
                        <Truck size={14} />
                        <span className="font-medium">Luar Kota</span>
                    </div>
                    <span className="text-slate-500">= Jabodetabek, Jatim, Pantura</span>
                </div>
            </div>

            {/* Price Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {items.map((item, idx) => (
                    <PriceCard key={idx} item={item} index={idx} />
                ))}
            </div>

            {/* Analysis Box */}
            <div className={`relative overflow-hidden rounded-2xl border ${isKitchen
                ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-amber-700/50'
                : 'bg-gradient-to-br from-orange-900/30 to-rose-900/20 border-orange-700/50'
                }`}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />

                <div className="relative p-6">
                    <div className="flex items-start gap-4">
                        <div className={`shrink-0 p-3 rounded-2xl ${isKitchen
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                            : 'bg-gradient-to-br from-orange-500 to-rose-500'
                            } shadow-xl`}>
                            <Sparkles size={24} className="text-white" />
                        </div>

                        <div className="flex-1">
                            <h4 className={`font-bold text-xl ${isKitchen ? 'text-amber-400' : 'text-orange-400'
                                }`}>
                                💡 Insight & Tips
                            </h4>

                            <div className="mt-4 space-y-4">
                                {isKitchen ? (
                                    <>
                                        <div className="flex gap-3 items-start">
                                            <CheckCircle size={18} className="shrink-0 text-emerald-400 mt-0.5" />
                                            <p className="text-slate-300">
                                                <strong className="text-amber-400">Harga Aluminium stabil</strong> di Rp 3.5jt/m
                                                baik dalam maupun luar kota — pilihan terbaik untuk budget!
                                            </p>
                                        </div>

                                        <div className="p-4 bg-slate-800/50 rounded-xl border border-amber-500/20">
                                            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                                                <Sparkles size={16} />
                                                🎁 Bonus Gratis Included
                                            </div>
                                            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle size={12} className="text-emerald-400" />
                                                    Rak Piring Stainless
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle size={12} className="text-emerald-400" />
                                                    Rak Sendok
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle size={12} className="text-emerald-400" />
                                                    Rak Bumbu
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle size={12} className="text-emerald-400" />
                                                    LED Strip
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex gap-3 items-start">
                                            <Info size={18} className="shrink-0 text-orange-400 mt-0.5" />
                                            <p className="text-slate-300">
                                                <strong className="text-orange-400">Wallpanel Klasik</strong> memiliki selisih terbesar
                                                (~12%) antara dalam dan luar kota.
                                            </p>
                                        </div>

                                        <div className="p-4 bg-slate-800/50 rounded-xl border border-orange-500/20">
                                            <div className="flex items-center gap-2 text-orange-400 font-bold mb-2">
                                                <Tag size={16} />
                                                💰 Tips Hemat Budget
                                            </div>
                                            <p className="text-sm text-slate-300">
                                                Untuk budget terbatas, <span className="text-amber-400 font-bold">WPC Panel</span> adalah
                                                pilihan terbaik dengan harga mulai Rp 550rb/m² — hasil tetap premium!
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Footer */}
            <div className="text-center p-6 bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-2xl border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-2">
                    Butuh konsultasi lebih lanjut?
                </p>
                <p className="text-white font-medium">
                    Gunakan <span className="text-amber-400 font-bold">AI Chat</span> untuk estimasi harga custom! 🚀
                </p>
            </div>
        </div>
    );
}
