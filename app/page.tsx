/**
 * =====================================================
 * HOME PAGE - DARK MODE ONLY
 * =====================================================
 * Arsitektur Layout Mobile:
 * - Header: Fixed Top, 56px height
 * - Content: Scrollable, top-[56px] bottom-[80px + safe-area]
 * - Navbar: Fixed Bottom, 80px + safe-area
 * 
 * AI Chat Mode: Fullscreen fixed overlay
 * =====================================================
 */

'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import PriceTable from './components/PriceTable';
import RulesPanel from './components/RulesPanel';
import AIAssistant from './components/AIAssistant';
// pricingData sekarang diakses langsung di komponen masing-masing

// Konstanta Layout - Single Source of Truth
const HEADER_HEIGHT = 56; // px
const NAVBAR_HEIGHT = 80; // px (excluding safe-area)

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('ai_assistant');
  const [scrolled, setScrolled] = useState(false);

  // Efek scroll untuk Header Glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // AI Chat = Fullscreen mode, hide main scroll
  const isAIChat = activeTab === 'ai_assistant';

  return (
    <div className={`
      min-h-screen bg-[#0B1120] text-slate-100 
      font-sans transition-colors duration-300
      ${isAIChat ? 'overflow-hidden h-screen md:overflow-auto md:h-auto' : ''}
    `}>

      {/* =====================================================
          MOBILE HEADER - Fixed Top
          Height: 56px | z-index: 50
         ===================================================== */}
      <header className={`
        md:hidden fixed top-0 left-0 right-0 z-50 
        h-[56px] flex items-center justify-between px-4
        transition-all duration-300
        ${scrolled
          ? 'bg-slate-900/95 backdrop-blur-xl shadow-sm border-b border-slate-800/50'
          : 'bg-[#0B1120]'
        }
      `}>
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div>
            <h1 className="font-bold text-base leading-none tracking-tight text-white">
              Home Putra
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Interior & Decor
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="px-2.5 py-1 rounded-full bg-emerald-900/30 border border-emerald-800 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-400">ONLINE</span>
        </div>
      </header>

      {/* =====================================================
          DESKTOP LAYOUT
         ===================================================== */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto p-8">
          <Header />
          <div className="mt-8">
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          <div className="mt-6 bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
            <div key={activeTab} className="animate-fade-in-up">
              {activeTab === 'kitchen' && (
                <div className="p-8">
                  <PriceTable />
                </div>
              )}
              {activeTab === 'wallpanel' && (
                <div className="p-8">
                  <PriceTable />
                </div>
              )}
              {activeTab === 'rules' && (
                <div className="p-8">
                  <RulesPanel />
                </div>
              )}
              {activeTab === 'guide' && (
                <div className="p-8">
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4 text-white">Panduan Fitur</h2>
                    <p className="text-slate-400">Gunakan AI Chat untuk konsultasi desain dan estimasi harga.</p>
                  </div>
                </div>
              )}
              {activeTab === 'ai_assistant' && (
                <div className="h-[700px]">
                  <AIAssistant />
                </div>
              )}
            </div>
          </div>

          <footer className="text-center py-8 text-slate-500 text-sm">
            <p>© 2026 Home Putra Interior. Crafted with ❤️ & AI.</p>
          </footer>
        </div>
      </div>

      {/* =====================================================
          MOBILE CONTENT AREA
          Top: 56px (header) | Bottom: 80px + safe-area (navbar)
         ===================================================== */}
      {!isAIChat && (
        <main className="
          md:hidden 
          fixed top-[56px] left-0 right-0 
          bottom-[calc(80px+env(safe-area-inset-bottom,0px))]
          overflow-y-auto overscroll-contain
          bg-[#0B1120]
        ">
          <div key={activeTab} className="animate-fade-in-up p-4">
            {activeTab === 'kitchen' && (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white">Kitchen Set</h2>
                  <p className="text-slate-400 text-sm">Daftar harga pemasangan terbaru</p>
                </div>
                <PriceTable />
              </>
            )}
            {activeTab === 'wallpanel' && (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white">Wallpanel</h2>
                  <p className="text-slate-400 text-sm">Dekorasi dinding aesthetic</p>
                </div>
                <PriceTable />
              </>
            )}
            {activeTab === 'rules' && (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white">Ketentuan</h2>
                  <p className="text-slate-400 text-sm">Syarat & ketentuan layanan</p>
                </div>
                <RulesPanel />
              </>
            )}
            {activeTab === 'guide' && (
              <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-white">Panduan Fitur</h2>
                <div className="space-y-3 text-slate-300 text-sm">
                  <p>Selamat datang di Aplikasi Pintar Home Putra Interior!</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><b>AI Chat:</b> Konsultasi desain dan hitung estimasi harga instan.</li>
                    <li><b>Kitchen:</b> Cek daftar harga paket Kitchen Set terbaru.</li>
                    <li><b>Wallpanel:</b> Katalog harga pemasangan Wallpanel.</li>
                    <li><b>Syarat:</b> Informasi biaya survey dan kebijakan.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* =====================================================
          MOBILE AI CHAT - Fullscreen Overlay
          Ends above navbar (80px + safe-area)
         ===================================================== */}
      {isAIChat && (
        <div
          className="md:hidden fixed top-[56px] left-0 right-0 z-40"
          style={{ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
        >
          <AIAssistant />
        </div>
      )}

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
          Height: 80px + safe-area | z-index: 50
         ===================================================== */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

    </div>
  );
}
