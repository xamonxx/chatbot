/**
 * =====================================================
 * RULES-PANEL.TSX - CONSTRUCT AI THEME
 * =====================================================
 * Theme: Light Mode, Clean & Informative
 * =====================================================
 */

'use client';

import { RuleItem, formatCurrency, rules, importantNotes, deliveryFees } from '../lib/pricing-data';
import {
    AlertCircle, CheckCircle, Lightbulb, Info, Wallet, TrendingUp, Shield, FileText, MapPin, Truck
} from 'lucide-react';

/**
 * Card untuk setiap rule
 */
function RuleCard({ rule, index }: { rule: RuleItem; index: number }) {
    const hasCharge = rule.costIn > 0 || rule.costOut > 0;

    return (
        <div
            className={`
                group relative overflow-hidden rounded-xl border transition-all duration-300 bg-white
                hover:shadow-lg hover:-translate-y-1
                ${hasCharge
                    ? 'border-red-100 hover:border-red-200'
                    : 'border-emerald-100 hover:border-emerald-200'
                }
            `}
        >
            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`
                        shrink-0 p-3 rounded-xl shadow-sm border
                        ${hasCharge
                            ? 'bg-red-50 text-red-500 border-red-100'
                            : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                        }
                    `}>
                        {hasCharge
                            ? <AlertCircle size={24} />
                            : <CheckCircle size={24} />
                        }
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className={`font-bold text-lg ${hasCharge ? 'text-red-700' : 'text-emerald-700'}`}>
                                {rule.title}
                            </h3>
                            {/* Impact Badge */}
                            <div className={`
                                inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                ${hasCharge
                                    ? 'bg-red-50 text-red-600 border border-red-100'
                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }
                            `}>
                                {rule.impact}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                            {rule.detail}
                        </p>
                    </div>
                </div>

                {/* Price Grid */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                    {/* Dalam Kota */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-1">
                            <MapPin size={12} />
                            Center City
                        </div>
                        <span className={`
                            font-mono font-bold text-sm
                            ${rule.costIn > 0 ? 'text-red-600' : 'text-emerald-600'}
                        `}>
                            {rule.costIn > 0 ? formatCurrency(rule.costIn) : 'FREE'}
                        </span>
                    </div>

                    {/* Luar Kota */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-1">
                            <Truck size={12} />
                            Outskirts
                        </div>
                        <span className={`
                            font-mono font-bold text-sm
                            ${rule.costOut > 0 ? 'text-red-600' : 'text-emerald-600'}
                        `}>
                            {rule.costOut > 0 ? formatCurrency(rule.costOut) : 'FREE'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RulesPanel() {
    return (
        <div className="space-y-8 animate-enter pb-20">

            {/* Header */}
            <div className="neo-card p-8 bg-white border border-gray-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText size={120} className="text-gray-900" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Policy & Guidelines</h2>
                    <p className="text-gray-500 max-w-xl">
                        Transparent pricing rules and operational guidelines for your interior projects.
                    </p>
                </div>
            </div>

            {/* Delivery Fees Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="text-[#F59E0B]" /> Delivery Standards
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {deliveryFees.map((fee, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col justify-between hover:border-[#F59E0B] transition-colors group">
                            <div>
                                <h4 className="font-bold text-gray-800 text-lg group-hover:text-[#F59E0B] transition-colors">{fee.area}</h4>
                                <p className="text-sm text-gray-400 mt-1">{fee.condition}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Base Fee</span>
                                <span className="font-mono font-bold text-gray-900 text-lg">
                                    {formatCurrency(fee.fee)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Rules Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {rules.map((rule, idx) => (
                    <RuleCard key={idx} rule={rule} index={idx} />
                ))}
            </div>

            {/* Tips Section */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <Lightbulb size={20} className="text-amber-500" />
                    Pro Tips
                </h3>
                <div className="grid gap-3">
                    {importantNotes.map((note, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-white/50 p-3 rounded-xl border border-amber-100/50">
                            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5 text-amber-600 font-bold text-xs">
                                {idx + 1}
                            </div>
                            <p className="text-amber-800 text-sm leading-relaxed font-medium">
                                {note}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
