/**
 * =====================================================
 * HEADER.TSX - KOMPONEN HEADER HOME PUTRA INTERIOR
 * =====================================================
 * Deskripsi: Header dengan branding (Dark Mode Only)
 * =====================================================
 */

'use client';

import {
    Crown, CheckCircle, Sparkles, MapPin
} from 'lucide-react';

/**
 * Komponen Header - Dark Mode Only
 */
export default function Header() {
    return (
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 text-white shadow-2xl">

            {/* ===== ELEMEN DEKORATIF BACKGROUND ===== */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-amber-500/10 to-yellow-500/5 rounded-full blur-3xl" />

            {/* Pattern overlay */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            {/* ===== KONTEN HEADER ===== */}
            <div className="relative z-10">

                {/* Baris 1: Logo dan Title */}
                <div className="flex items-start justify-between gap-4">
                    {/* Logo dan Judul */}
                    <div className="flex items-center gap-4">
                        {/* Logo Icon */}
                        <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 animate-float">
                            <Crown size={32} className="text-white" strokeWidth={2} />
                        </div>

                        {/* Info Teks */}
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                <span className="text-amber-400">Home Putra</span>
                                <span className="text-white"> Interior</span>
                            </h1>
                            <p className="text-slate-400 text-sm md:text-base mt-1">
                                Mendefinisikan Ruang, Meningkatkan Gaya Hidup Anda
                            </p>
                        </div>
                    </div>
                </div>

                {/* Subtitle */}
                <div className="mt-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                        <Sparkles size={20} className="text-amber-400" />
                        Dashboard Analisis Harga & AI Consultant
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Komparasi harga interior & estimasi budget dengan teknologi AI
                    </p>
                </div>

                {/* Badge Status */}
                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    {/* Badge Lokasi */}
                    <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 hover:bg-white/15 transition-all cursor-default">
                        <MapPin size={14} className="text-amber-400" />
                        <span className="text-slate-300">Bandung & Jawa Barat</span>
                    </span>

                    {/* Badge Update */}
                    <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 hover:bg-white/15 transition-all cursor-default">
                        <CheckCircle size={14} className="text-emerald-400" />
                        <span className="text-slate-300">Harga Update 2024/2025</span>
                    </span>

                    {/* Badge AI */}
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/30 to-orange-500/30 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-400/30 animate-pulse">
                        <Sparkles size={14} className="text-amber-300" />
                        <span className="text-amber-100 font-medium">AI Consultant Active</span>
                    </span>
                </div>
            </div>

            {/* Gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500" />
        </header>
    );
}
