/**
 * =====================================================
 * LAYOUT.TSX - ROOT LAYOUT HOME PUTRA INTERIOR
 * =====================================================
 * Dark Mode Only - No Theme Switching
 * =====================================================
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Konfigurasi Font
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Metadata SEO
 */
export const metadata: Metadata = {
  title: "Dashboard Harga Interior | Home Putra Interior - Bandung",
  description: "Analisis harga interior premium dengan AI Consultant. Bandingkan harga kitchen set, wallpanel, dan dapatkan estimasi budget. Home Putra Interior - Bandung & Jawa Barat.",
  keywords: [
    "interior bandung",
    "kitchen set bandung",
    "wallpanel premium",
    "harga interior",
    "home putra interior",
    "desain interior jawa barat"
  ],
  openGraph: {
    title: "Home Putra Interior - Dashboard Harga & AI Consultant",
    description: "Mendefinisikan Ruang, Meningkatkan Gaya Hidup Anda",
    type: "website",
    locale: "id_ID",
    siteName: "Home Putra Interior",
  },
  authors: [{ name: "Home Putra Interior" }],
  creator: "Home Putra Interior",
};

/**
 * Root Layout Component - Dark Mode Only
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Mobile Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0B1120" />
        {/* PWA-like experience */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B1120] text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
