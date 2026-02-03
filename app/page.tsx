/**
 * =====================================================
 * HALAMAN UTAMA - CONSTRUCT AI THEME
 * =====================================================
 * Deskripsi: Halaman utama aplikasi dengan layout
 *            Sidebar + Main Content yang responsif
 * 
 * Fitur:
 * - Navigasi tab untuk berbagai section
 * - Sidebar gelap dengan menu navigasi
 * - Konten utama dengan background terang
 * - Responsif untuk mobile dan desktop
 * 
 * Optimasi Performa:
 * - Lazy loading komponen berat
 * - Minimalisir re-render dengan state management
 * - CSS yang efisien untuk animasi smooth
 * =====================================================
 */

'use client';

// === IMPORT DEPENDENCIES ===
import { useState, useEffect, lazy, Suspense, memo } from 'react';
import { Sparkles } from 'lucide-react';

// === IMPORT KOMPONEN ===
// Komponen utama yang selalu dimuat
import TabNavigation from './components/TabNavigation';

// Lazy loading untuk komponen berat (optimasi performa mobile)
const PriceTable = lazy(() => import('./components/PriceTable'));
const RulesPanel = lazy(() => import('./components/RulesPanel'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));

// === KOMPONEN LOADING ===
// Ditampilkan saat lazy component sedang dimuat
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Memuat...</span>
      </div>
    </div>
  );
});

// === KOMPONEN UTAMA ===
export default function Home() {
  // --- STATE MANAGEMENT ---
  // State untuk menu mobile (buka/tutup)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State untuk tab yang aktif (default: ai_consultant)
  const [activeTab, setActiveTab] = useState('ai_consultant');

  // State untuk status mounting (client-side)
  const [isMounted, setIsMounted] = useState(false);

  // --- EFEK SAMPING ---
  // Menandai komponen sudah di-mount di client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- FUNGSI HANDLER ---
  /**
   * Menangani perpindahan tab dari navigasi
   * @param tabId - ID tab yang dipilih
   */
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Tutup menu mobile setelah memilih tab
    setMobileMenuOpen(false);
  };

  /**
   * Menangani klik overlay untuk menutup menu mobile
   */
  const handleOverlayClick = () => {
    setMobileMenuOpen(false);
  };

  // --- RENDER KOMPONEN ---
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* =====================================================
          OVERLAY MOBILE - Muncul saat menu mobile terbuka
         ===================================================== */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={handleOverlayClick}
        />
      )}

      {/* =====================================================
          SIDEBAR - Navigasi utama aplikasi
          - Desktop: Selalu terlihat di kiri
          - Mobile: Slide in dari kiri saat menu terbuka
         ===================================================== */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-[280px] 
        bg-[#0A0A0A] transform transition-transform duration-300 ease-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-full
      `}>

        {/* --- Header Sidebar: Logo dan Nama Perusahaan --- */}
        <div className="p-6 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            {/* Logo dengan animasi pulse */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight">
                Construct <span className="text-[#F59E0B]">AI</span>
              </h1>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Online
              </p>
            </div>
          </div>
        </div>

        {/* --- Menu Navigasi Tab --- */}
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* =====================================================
          KONTEN UTAMA - Area konten yang dapat di-scroll
         ===================================================== */}
      <main className="flex-1 bg-white h-full flex flex-col relative z-0 overflow-hidden">

        {/* --- Header Desktop: Judul halaman di tengah --- */}
        <header className="hidden md:flex h-16 border-b border-gray-100 items-center justify-center px-8 bg-white/80 backdrop-blur-md shrink-0 z-20">
          <h2 className="text-xl font-bold text-gray-900 capitalize">
            {activeTab.replace(/_/g, ' ')}
          </h2>
        </header>

        {/* --- Header Mobile: Hamburger + Judul + Status --- */}
        <header className="md:hidden flex h-[60px] items-center justify-between px-4 border-b border-gray-100 shrink-0 bg-white/90 backdrop-blur-md z-30">
          {/* Tombol Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform"
            aria-label="Buka menu"
          >
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-gray-800" />
              <span className="block w-4 h-0.5 bg-gray-800" />
              <span className="block w-5 h-0.5 bg-gray-800" />
            </div>
          </button>

          {/* Judul Halaman */}
          <h2 className="text-lg font-bold text-gray-900 capitalize">
            {activeTab.replace(/_/g, ' ')}
          </h2>

          {/* Badge Status Online */}
          <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
            ONLINE
          </span>
        </header>

        {/* --- Konten Halaman Berdasarkan Tab Aktif --- */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Hanya render jika sudah mounted (optimasi hydration) */}
          {isMounted && (
            <Suspense fallback={<LoadingSpinner />}>
              {/* Tab: AI Konsultan */}
              {activeTab === 'ai_consultant' && <AIAssistant />}

              {/* Tab: Harga Dalam Kota */}
              {activeTab === 'harga_dalam_kota' && (
                <div className="p-4 md:p-8 h-full overflow-y-auto">
                  <PriceTable location="dalam_kota" />
                </div>
              )}

              {/* Tab: Harga Luar Kota */}
              {activeTab === 'harga_luar_kota' && (
                <div className="p-4 md:p-8 h-full overflow-y-auto">
                  <PriceTable location="luar_kota" />
                </div>
              )}

              {/* Tab: Aturan & FAQ */}
              {activeTab === 'rules' && (
                <div className="p-4 md:p-8 h-full overflow-y-auto">
                  <RulesPanel />
                </div>
              )}

              {/* Tab: Panduan Pengguna */}
              {activeTab === 'guide' && (
                <div className="p-6 md:p-8 max-w-4xl mx-auto">
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Sparkles className="text-amber-500" size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Panduan Penggunaan
                        </h2>
                        <p className="text-gray-500 text-sm">
                          Cara menggunakan aplikasi ini
                        </p>
                      </div>
                    </div>

                    {/* Daftar langkah panduan */}
                    <div className="space-y-4 text-gray-600">
                      <p className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                        <span>Pilih tab <strong>AI Konsultan</strong> untuk bertanya tentang harga material.</span>
                      </p>
                      <p className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                        <span>Gunakan tab <strong>Harga Dalam/Luar Kota</strong> untuk melihat katalog lengkap.</span>
                      </p>
                      <p className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                        <span>Baca <strong>Aturan & FAQ</strong> untuk memahami kebijakan harga dan pengiriman.</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}
