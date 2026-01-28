/**
 * =====================================================
 * PRICE-TABLE.TSX - KOMPONEN TABEL HARGA LENGKAP
 * =====================================================
 * Menampilkan semua kategori produk dengan UI modern
 * Dark Mode Only
 * =====================================================
 */

'use client';

import { useState } from 'react';
import {
    categories, pricingMeta, importantNotes, formatCurrency,
    type Category, type PriceItem
} from '../lib/pricing-data';
import {
    ChefHat, LayoutDashboard, Sofa, BedDouble, Warehouse,
    Wrench, Sparkles, ChevronDown, ChevronUp, Search,
    Info, CheckCircle, MapPin, Calendar, Building2,
    Grid3X3, Hammer, Palette, BoxIcon
} from 'lucide-react';

// Icon mapping untuk setiap kategori
const categoryIcons: Record<number, React.ElementType> = {
    1: ChefHat,      // Aluminium
    2: BoxIcon,      // PVC Board
    3: Palette,      // Cat Duco
    4: Grid3X3,      // Multipleks
    5: BoxIcon,      // Blockboard
    6: Hammer,       // Industrial
    7: Sofa,         // Mini Bar
    8: Warehouse,    // Wardrobe
    9: Sparkles,     // Meja Rias
    10: BedDouble,   // Kamar Tidur
    11: BedDouble,   // Dipan Tingkat
    12: Sofa,        // Livingroom
    13: Warehouse,   // Bawah Tangga
    14: LayoutDashboard, // Add-on
    15: Wrench,      // Aksesoris
    16: Wrench,      // Upgrade
    17: Hammer       // Pekerjaan Sipil
};

/**
 * Card Item untuk setiap produk
 */
function PriceCard({ item }: { item: PriceItem }) {
    return (
        <div className="group bg-slate-800/40 hover:bg-slate-800/70 rounded-xl p-4 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300">
            <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1">
                    <h4 className="font-semibold text-white group-hover:text-amber-400 transition-colors text-sm">
                        {item.name}
                    </h4>
                    {item.variant && (
                        <span className="text-xs text-amber-400/80">{item.variant}</span>
                    )}
                </div>
                <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-amber-400">
                        {formatCurrency(item.price)}
                    </div>
                    <div className="text-[10px] text-slate-500">/{item.unit}</div>
                </div>
            </div>

            {(item.finishing || item.specs) && (
                <div className="mt-2 pt-2 border-t border-slate-700/50">
                    {item.finishing && (
                        <p className="text-xs text-slate-400">
                            <span className="text-slate-500">Finishing:</span> {item.finishing}
                        </p>
                    )}
                    {item.specs && (
                        <p className="text-xs text-slate-400 mt-1">
                            <span className="text-slate-500">Specs:</span> {item.specs}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Expandable Category Section
 */
function CategorySection({ category, defaultOpen = false }: { category: Category; defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const Icon = categoryIcons[category.id] || ChefHat;

    return (
        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
            {/* Header - Clickable */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                        <Icon size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-white">{category.name}</h3>
                        <p className="text-xs text-slate-400">{category.items.length} item</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                        Mulai {formatCurrency(Math.min(...category.items.map(i => i.price)))}
                    </span>
                    {isOpen ? (
                        <ChevronUp size={20} className="text-slate-400" />
                    ) : (
                        <ChevronDown size={20} className="text-slate-400" />
                    )}
                </div>
            </button>

            {/* Content - Expandable */}
            {isOpen && (
                <div className="p-4 pt-0 border-t border-slate-700/50">
                    {category.note && (
                        <div className="mb-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex gap-2 items-start">
                            <Info size={14} className="shrink-0 text-amber-400 mt-0.5" />
                            <p className="text-sm text-amber-200/80">{category.note}</p>
                        </div>
                    )}
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {category.items.map((item) => (
                            <PriceCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Main Component
 */
export default function PriceTable() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    // Filter categories based on search and selection
    const filteredCategories = categories.filter(cat => {
        if (selectedCategory !== null && cat.id !== selectedCategory) return false;
        if (!searchTerm) return true;

        const term = searchTerm.toLowerCase();
        return (
            cat.name.toLowerCase().includes(term) ||
            cat.items.some(item =>
                item.name.toLowerCase().includes(term) ||
                item.variant?.toLowerCase().includes(term)
            )
        );
    });

    return (
        <div className="space-y-6">

            {/* ===== HEADER INFO ===== */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            📋 Daftar Harga Lengkap
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {pricingMeta.companyName}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                            <MapPin size={12} />
                            {pricingMeta.region}
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                            <Calendar size={12} />
                            Update: {pricingMeta.period}
                        </span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-amber-400">{categories.length}</div>
                        <div className="text-xs text-slate-400">Kategori</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-amber-400">
                            {categories.reduce((sum, cat) => sum + cat.items.length, 0)}
                        </div>
                        <div className="text-xs text-slate-400">Total Produk</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-emerald-400">GRATIS</div>
                        <div className="text-xs text-slate-400">Survey & Desain 3D</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-blue-400">Rp 2jt</div>
                        <div className="text-xs text-slate-400">Mulai dari</div>
                    </div>
                </div>
            </div>

            {/* ===== SEARCH & FILTER ===== */}
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari produk... (cth: kitchen, wardrobe, wallpanel)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                </div>

                {/* Category Filter */}
                <select
                    value={selectedCategory ?? ''}
                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                    className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* ===== CATEGORIES LIST ===== */}
            <div className="space-y-4">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Search size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Tidak ada produk yang ditemukan</p>
                        <p className="text-sm mt-2">Coba kata kunci lain</p>
                    </div>
                ) : (
                    filteredCategories.map((category, idx) => (
                        <CategorySection
                            key={category.id}
                            category={category}
                            defaultOpen={idx === 0 && !searchTerm}
                        />
                    ))
                )}
            </div>

            {/* ===== NOTES ===== */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                    <Info size={18} className="text-amber-400" />
                    Catatan Penting
                </h3>
                <ul className="space-y-2">
                    {importantNotes.map((note, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle size={14} className="shrink-0 text-emerald-400 mt-0.5" />
                            <span>{note}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ===== CTA ===== */}
            <div className="text-center p-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-2xl border border-amber-700/30">
                <Building2 size={32} className="mx-auto mb-3 text-amber-400" />
                <p className="text-white font-medium mb-2">
                    Butuh estimasi harga custom?
                </p>
                <p className="text-slate-400 text-sm">
                    Gunakan <span className="text-amber-400 font-bold">AI Chat</span> untuk konsultasi & perhitungan otomatis! 🚀
                </p>
            </div>
        </div>
    );
}
