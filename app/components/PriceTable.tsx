/**
 * =====================================================
 * PRICE TABLE - Tabel Harga Produk
 * =====================================================
 * Deskripsi: Menampilkan katalog harga berdasarkan lokasi
 *            (Dalam Kota atau Luar Kota)
 * 
 * Fitur:
 * - Filter pencarian berdasarkan nama/specs
 * - Kategori accordion yang bisa dibuka/tutup
 * - Responsif untuk mobile dan desktop
 * - Animasi smooth untuk UX yang baik
 * 
 * Sumber Data: dataHargaLuarkota&dalamKota.json
 * 
 * Props:
 * - location: 'dalam_kota' | 'luar_kota'
 * =====================================================
 */

'use client';

// === IMPORT DEPENDENCIES ===
import { useState, useMemo, memo } from 'react';
import {
    getLocationPricing,
    getPricingMeta,
    importantNotes,
    formatCurrency,
    type PriceCategory,
    type PriceItem,
    type LocationType
} from '../lib/location-pricing';
import {
    ChefHat,       // Ikon Kitchen Set
    LayoutDashboard,
    Sofa,          // Ikon Furniture
    BedDouble,     // Ikon Bedroom
    Warehouse,     // Ikon Storage
    Wrench,        // Ikon Tools
    Sparkles,
    ChevronDown,   // Ikon Expand
    Search,        // Ikon Pencarian
    Info,          // Ikon Informasi
    BoxIcon,       // Ikon Box
    Hammer,        // Ikon Hammer
    Palette,       // Ikon Warna
    Grid3X3        // Ikon Grid
} from 'lucide-react';

// === MAPPING IKON KATEGORI ===
// Setiap ID kategori dipetakan ke ikon yang sesuai
const categoryIcons: Record<number, React.ElementType> = {
    1: ChefHat,      // Kitchen Set
    2: BoxIcon,      // Minibar
    3: Palette,      // Wardrobe
    4: Grid3X3,      // Bawah Tangga
    5: Hammer,       // Pekerjaan Sipil
    6: Hammer,
    7: Sofa,
    8: Warehouse,
    9: Sparkles,
    10: BedDouble,
    11: BedDouble,
    12: Sofa,
    13: Warehouse,
    14: LayoutDashboard,
    15: Wrench,
    16: Wrench,
    17: Hammer
};

// === KOMPONEN KARTU HARGA ===
/**
 * Menampilkan kartu individual untuk setiap produk
 * dengan informasi harga, spek, dan catatan
 */
const PriceCard = memo(function PriceCard({ item }: { item: PriceItem }) {
    return (
        <div className="p-5 group flex flex-col h-full relative overflow-hidden bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
            {/* Efek Glow saat Hover */}
            <div
                className="absolute top-0 right-0 w-20 h-20 bg-[#F59E0B] opacity-0 group-hover:opacity-5 blur-[40px] transition-all duration-500"
                aria-hidden="true"
            />

            {/* Header: Nama Produk & Harga */}
            <div className="flex justify-between items-start gap-3 mb-3 relative z-10">
                {/* Nama dan Variant */}
                <div className="space-y-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-base group-hover:text-[#D97706] transition-colors leading-tight">
                        {item.name}
                    </h4>
                    {item.variant && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] border border-gray-200 tracking-wide uppercase font-medium">
                            {item.variant}
                        </span>
                    )}
                </div>

                {/* Harga dan Unit */}
                <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-[#D97706]">
                        {formatCurrency(item.price)}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                        /{item.unit}
                    </div>
                </div>
            </div>

            {/* Footer: Detail Spesifikasi */}
            <div className="mt-auto pt-3 border-t border-gray-100 relative z-10">
                <div className="space-y-1.5">
                    {/* Finishing */}
                    {item.finishing && (
                        <div className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1 shrink-0 group-hover:bg-[#F59E0B] transition-colors" />
                            <span>
                                <span className="text-gray-400">Finishing:</span> {item.finishing}
                            </span>
                        </div>
                    )}

                    {/* Spesifikasi */}
                    {item.specs && (
                        <div className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1 shrink-0 group-hover:bg-[#F59E0B] transition-colors" />
                            <span className="line-clamp-2">
                                <span className="text-gray-400">Spek:</span> {item.specs}
                            </span>
                        </div>
                    )}

                    {/* Catatan Khusus */}
                    {item.note && (
                        <div className="flex items-start gap-2 text-xs text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                            <span className="italic">{item.note}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

// === KOMPONEN SECTION KATEGORI ===
/**
 * Menampilkan section accordion untuk setiap kategori
 * yang bisa dibuka/tutup untuk melihat daftar produk
 */
const CategorySection = memo(function CategorySection({
    category,
    defaultOpen = false
}: {
    category: PriceCategory;
    defaultOpen?: boolean
}) {
    // State untuk buka/tutup accordion
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // Ambil ikon berdasarkan ID kategori
    const Icon = categoryIcons[category.id] || ChefHat;

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mb-4 shadow-sm">
            {/* Header Accordion - Bisa diklik untuk toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                aria-expanded={isOpen}
            >
                {/* Ikon dan Label Kategori */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 text-[#D97706]">
                        <Icon size={20} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900 text-lg tracking-tight">
                            {category.name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                            {category.items.length} item tersedia
                        </p>
                    </div>
                </div>

                {/* Ikon Expand/Collapse */}
                <div className={`
          p-2 rounded-full border border-gray-200 transition-all duration-300 
          ${isOpen ? 'rotate-180 bg-gray-100' : 'bg-white'}
        `}>
                    <ChevronDown size={16} className="text-gray-400" />
                </div>
            </button>

            {/* Konten Accordion - Daftar Produk */}
            <div
                className={`
          transition-all duration-500 ease-in-out overflow-hidden bg-gray-50/50 
          ${isOpen ? 'max-h-[2000px] opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'}
        `}
            >
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((item, idx) => (
                        <PriceCard key={item.id || idx} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
});

// === TIPE PROPS KOMPONEN UTAMA ===
interface PriceTableProps {
    location: LocationType; // 'dalam_kota' atau 'luar_kota'
}

// === KOMPONEN UTAMA ===
export default function PriceTable({ location }: PriceTableProps) {
    // --- STATE ---
    // Kata kunci pencarian
    const [searchTerm, setSearchTerm] = useState('');

    // --- COMPUTED VALUES ---
    // Label lokasi untuk tampilan
    const locationLabel = location === 'dalam_kota' ? 'Dalam Kota' : 'Luar Kota';

    // Metadata harga dari sumber data
    const pricingMeta = getPricingMeta();

    // Ambil data kategori berdasarkan lokasi (memoized untuk performa)
    const categories = useMemo(
        () => getLocationPricing(location),
        [location]
    );

    // Filter kategori berdasarkan kata kunci pencarian
    const filteredCategories = useMemo(() => {
        // Jika tidak ada pencarian, kembalikan semua
        if (!searchTerm.trim()) return categories;

        const term = searchTerm.toLowerCase();

        return categories.map((cat: PriceCategory) => {
            // Filter item yang cocok dengan pencarian
            const items = cat.items.filter((item: PriceItem) =>
                item.name.toLowerCase().includes(term) ||
                item.specs?.toLowerCase().includes(term) ||
                item.variant?.toLowerCase().includes(term)
            );
            return { ...cat, items };
        }).filter((cat: PriceCategory) => cat.items.length > 0);
    }, [categories, searchTerm]);

    // --- RENDER ---
    return (
        <div className="space-y-8 pb-20">

            {/* === HEADER: Judul & Pencarian === */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
                {/* Baris Atas: Judul dan Input Pencarian */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Judul */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Katalog Harga - {locationLabel}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Update terakhir: {pricingMeta.last_updated}
                        </p>
                    </div>

                    {/* Input Pencarian */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search
                                size={18}
                                className="text-gray-400 group-focus-within:text-[#F59E0B] transition-colors"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari material..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] w-full md:w-80 transition-all"
                        />
                    </div>
                </div>

                {/* Filter Cepat: Tombol kategori populer */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    {['Kitchen Set', 'Wardrobe', 'Minibar', 'Wallpanel'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSearchTerm(filter)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors active:scale-95"
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* === DAFTAR KATEGORI === */}
            <div className="space-y-4">
                {filteredCategories.length > 0 ? (
                    // Tampilkan kategori yang sudah difilter
                    filteredCategories.map((category) => (
                        <CategorySection
                            key={category.id}
                            category={category}
                            defaultOpen={true}
                        />
                    ))
                ) : (
                    // Pesan jika tidak ada hasil
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Search size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Tidak ada item ditemukan
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Coba ubah kata kunci pencarian
                        </p>
                    </div>
                )}
            </div>

            {/* === CATATAN PENTING === */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-3">
                    <Info size={18} /> Informasi Penting
                </h4>
                <ul className="grid md:grid-cols-2 gap-3">
                    {importantNotes.map((note, idx) => (
                        <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-amber-800/80"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                            <span className="leading-relaxed">{note}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
