/**
 * =====================================================
 * TAB NAVIGATION - Komponen Menu Navigasi Sidebar
 * =====================================================
 * Deskripsi: Menu navigasi dengan ikon untuk berpindah
 *            antar section dalam aplikasi
 * 
 * Fitur:
 * - Ikon visual untuk setiap menu
 * - Highlight aktif dengan animasi smooth
 * - Label deskripsi untuk setiap menu
 * - Responsif untuk mobile dan desktop
 * 
 * Props:
 * - activeTab: Tab yang sedang aktif
 * - onTabChange: Callback saat tab berubah
 * =====================================================
 */

'use client';

// === IMPORT DEPENDENCIES ===
import { memo } from 'react';
import {
    Bot,           // Ikon untuk AI Assistant
    MapPin,        // Ikon untuk Harga Dalam Kota
    MapPinOff,     // Ikon untuk Harga Luar Kota
    ScrollText,    // Ikon untuk Aturan & FAQ
    HelpCircle     // Ikon untuk Panduan
} from 'lucide-react';

// === TIPE DATA ===
interface TabNavigationProps {
    activeTab: string;                    // ID tab yang sedang aktif
    onTabChange: (tabId: string) => void; // Fungsi callback perubahan tab
}

// === DATA MENU ===
// Daftar menu navigasi dengan ikon dan label
const menuItems = [
    {
        id: 'ai_consultant',
        label: 'AI Konsultan',
        icon: Bot,
        description: 'Chat & Estimasi Harga'
    },
    {
        id: 'harga_dalam_kota',
        label: 'Harga Dalam Kota',
        icon: MapPin,
        description: 'Bandung & Sekitarnya'
    },
    {
        id: 'harga_luar_kota',
        label: 'Harga Luar Kota',
        icon: MapPinOff,
        description: 'Luar Jawa Barat'
    },
    {
        id: 'rules',
        label: 'Aturan & FAQ',
        icon: ScrollText,
        description: 'Syarat Ketentuan'
    },
    {
        id: 'guide',
        label: 'Panduan',
        icon: HelpCircle,
        description: 'Cara Penggunaan'
    },
];

// === KOMPONEN UTAMA ===
// Menggunakan memo untuk mencegah re-render yang tidak perlu
const TabNavigation = memo(function TabNavigation({
    activeTab,
    onTabChange
}: TabNavigationProps) {
    return (
        <nav className="flex-1 py-4 overflow-y-auto">
            {/* --- Label Section Menu --- */}
            <p className="px-5 mb-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Menu
            </p>

            {/* --- Daftar Menu Items --- */}
            <div className="space-y-1 px-3">
                {menuItems.map((item) => {
                    // Cek apakah menu ini sedang aktif
                    const isActive = activeTab === item.id;
                    // Ambil komponen ikon
                    const IconComponent = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 ease-out
                group relative overflow-hidden
                ${isActive
                                    ? 'bg-gradient-to-r from-[#F59E0B]/20 to-[#F59E0B]/5 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
              `}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {/* Indikator Aktif di Kiri */}
                            {isActive && (
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#F59E0B] rounded-r-full"
                                    aria-hidden="true"
                                />
                            )}

                            {/* Container Ikon */}
                            <span className={`
                w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                transition-all duration-200
                ${isActive
                                    ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                                    : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300'
                                }
              `}>
                                <IconComponent size={18} />
                            </span>

                            {/* Label dan Deskripsi */}
                            <div className="text-left min-w-0">
                                <span className={`
                  block text-sm font-medium truncate
                  ${isActive ? 'text-white' : ''}
                `}>
                                    {item.label}
                                </span>
                                <span className="block text-[10px] text-gray-500 truncate">
                                    {item.description}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
});

// === EXPORT ===
export default TabNavigation;
