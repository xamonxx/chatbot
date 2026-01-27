# 🏠 Dashboard Analisis Harga Interior

> **Aplikasi analisis harga interior dengan AI Assistant berbasis Gemini AI**

PT. Menuju Keindahan Indonesia

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285f4)

---

## 📋 Deskripsi

Dashboard modern untuk analisis dan perbandingan harga produk interior. Dilengkapi dengan **4 fitur AI canggih** yang membantu konsultan dan klien dalam:

- Membandingkan harga antara wilayah dalam kota vs luar kota
- Menghitung estimasi budget proyek
- Mendapatkan saran optimasi untuk menghindari charge
- Membuat proposal penawaran otomatis

---

## ✨ Fitur Utama

### 📊 Tabel Harga Interaktif
- **Kitchen Set** - Aluminium & Multipleks dengan perbandingan harga
- **Wallpanel & Decor** - Minimalis, Semi Klasik, Klasik, WPC Panel
- **Aturan & Syarat** - Hidden cost dan tips hemat

### 🤖 AI Smart Assistant (4 Mode)

| Mode | Fungsi |
|------|--------|
| 💬 **Chat Consultant** | Chatbot untuk konsultasi harga & material |
| 📱 **Smart Calculator** | Kalkulator proyek dengan saran optimasi |
| ⚖️ **Material Battle** | Perbandingan head-to-head 2 material |
| 📄 **Proposal Generator** | Pembuat proposal WhatsApp otomatis |

---

## 🚀 Instalasi

### Prasyarat
- Node.js 18+ (disarankan v22)
- NPM atau Yarn
- API Key Google Gemini

### Langkah Instalasi

```bash
# 1. Clone repository (atau download)
cd c:\laragon\www\chatbot

# 2. Install dependencies
npm install

# 3. Setup environment
# Copy .env.example ke .env.local
cp .env.example .env.local

# 4. Edit .env.local dan masukkan API Key Gemini
# NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here

# 5. Jalankan development server
npm run dev
```

### Mendapatkan API Key Gemini

1. Buka [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan akun Google
3. Klik "Create API Key"
4. Copy API key ke file `.env.local`

---

## 📁 Struktur Folder

```
chatbot/
├── app/
│   ├── components/         # Komponen React
│   │   ├── AIAssistant.tsx     # Komponen AI dengan 4 mode
│   │   ├── Header.tsx          # Header dashboard
│   │   ├── PriceTable.tsx      # Tabel harga
│   │   ├── RulesPanel.tsx      # Panel aturan
│   │   └── TabNavigation.tsx   # Navigasi tab
│   ├── lib/
│   │   └── pricing-data.ts     # Data harga & helper functions
│   ├── globals.css             # CSS global dengan animasi
│   ├── layout.tsx              # Layout root
│   └── page.tsx                # Halaman utama
├── public/                 # File statis
├── .env.local              # Environment variables (lokal)
├── .env.example            # Template environment
├── package.json            # Dependencies
└── README.md               # Dokumentasi ini
```

---

## 🎨 Teknologi

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Next.js** | 16.1.5 | Framework React dengan App Router |
| **React** | 19.2.3 | Library UI |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4 | Utility-first styling |
| **Lucide React** | Latest | Icon library |
| **Gemini AI** | 2.0 Flash | AI Assistant |

---

## 📝 Script NPM

```bash
# Development mode dengan hot reload
npm run dev

# Build untuk production
npm run build

# Jalankan production build
npm start

# Linting
npm run lint
```

---

## 🔧 Konfigurasi

### Environment Variables

| Variable | Deskripsi | Required |
|----------|-----------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | API Key Google Gemini | ✅ Ya |

### Tailwind CSS

Project menggunakan Tailwind CSS v4 dengan konfigurasi:
- Custom animations (fade-in, float, pulse-glow)
- Glass morphism effect
- Custom scrollbar
- Dark mode support (prefers-color-scheme)

---

## 📊 Data Harga

Data harga disimpan di `app/lib/pricing-data.ts` dan dapat dimodifikasi sesuai kebutuhan:

```typescript
// Contoh struktur data
export const pricingData = {
  kitchen: [
    {
      item: "Kitchen Set Aluminium",
      spec: "Bahan ACP 4mm...",
      priceIn: 3500000,   // Dalam kota
      priceOut: 3500000,  // Luar kota
      unit: "/m¹",
      note: "Catatan..."
    }
  ],
  // ...
};
```

---

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

---

## 📄 Lisensi

© 2024/2025 PT. Menuju Keindahan Indonesia. All rights reserved.

---

## 🆘 Troubleshooting

### Error: API Key tidak valid
- Pastikan API key sudah dimasukkan di `.env.local`
- Restart development server setelah mengubah `.env.local`

### Error: Module not found
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules
npm install
```

### Port 3000 sudah digunakan
```bash
# Jalankan di port lain
npm run dev -- -p 3001
```

---

**Made with ❤️ and powered by Gemini AI**
