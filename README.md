# 🏠 Home Putra Interior AI

> **Aplikasi Cerdas Analisis Harga Interior dengan RAG (Retrieval-Augmented Generation)**
>
> 🚀 **Teknologi**: Next.js 16 • TiDB Cloud (Vector DB) • Google Gemini/Xenova AI • Tailwind CSS v4

---

## 📖 Tentang Aplikasi

Aplikasi ini adalah dashboard modern untuk PT. Menuju Keindahan Indonesia (Home Putra Interior) yang berfungsi untuk menghitung estimasi harga, konsultasi desain, dan manajemen katalog harga.

### 🔥 Apa itu RAG? (Fitur Unggulan)
Aplikasi ini menggunakan teknologi **RAG (Retrieval-Augmented Generation)**.
Berbeda dengan Chatbot biasa yang sering "halusinasi" (mengarang jawaban), aplikasi ini:
1.  **Mencari Data Dulu**: Saat user bertanya, sistem mencari data produk yang relevan di database **TiDB Vector**.
2.  **Menjawab dengan Fakta**: Data tersebut dikirim ke AI sebagai referensi.
3.  **Akurasi Tinggi**: AI menjawab pertanyaan hanya berdasarkan data harga asli perusahaan.

---

## ✨ Fitur Utama

1.  **🧠 AI Consultant (RAG Power)**
    *   Tanya jawab harga & spesifikasi produk (Data Real-time).
    *   Estimasi budget proyek otomatis.
    *   Konsultasi desain & material.
2.  **📊 Tabel Harga Digital**
    *   Katalog Kitchen Set, Wallpanel, Wardrobe.
    *   Pencarian cepat.
3.  **⚡ Perbandingan Material**
    *   Battle fitur antar bahan (misal: PVC vs Multipleks).
4.  **📝 Proposal Generator**
    *   Buat draft penawaran WhatsApp otomatis dalam hitungan detik.

---

## 🛠️ Teknologi & Arsitektur

*   **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4.
*   **Database**: **TiDB Serverless** (MySQL-Compatible + Vector Search).
*   **AI Embedding**:
    *   **Xenova/transformers** (Lokal): Untuk mengubah teks produk menjadi vektor matematika (GRATIS, Tanpa Limit).
*   **LLM (Otak AI)**:
    *   **Groq API (Llama 3)**: Untuk memproses jawaban bahasa alami yang super cepat.

---

## 🚀 Cara Menjalankan Aplikasi (Panduan Lengkap)

Karena di komputer ini (Laravel/Laragon environment) path `npm` belum ter-set global, gunakan cara berikut:

### ➤ Cara Termudah (Paling Direkomendasikan)
Cukup klik kanan file `RUN_APP.ps1` dan pilih **Run with PowerShell**, atau ketik di terminal:

```powershell
./RUN_APP.ps1
```

Script ini otomatis akan:
1.  Mengatur Path Node.js.
2.  Menawarkan update database (jika perlu).
3.  Menjalankan server di `http://localhost:3000`.

---

### ➤ Cara Manual (Langkah demi Langkah)

Jika ingin menjalankan manual lewat terminal VS Code:

#### 1. Setup Environment
Pastikan file `.env.local` sudah berisi konfigurasi:
```env
# TiDB Database (Vector)
TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_USER=xxxxx.root
TIDB_PASSWORD=xxxxx
TIDB_DATABASE=DB_listHarga

# API Keys
NEXT_PUBLIC_GEMINI_API_KEY=xxxxx
NEXT_PUBLIC_GROQ_API_KEY=xxxxx
```

#### 2. Update Database (Running RAG)
Jalankan perintah ini SATU KALI saja saat ada perubahan harga/produk di `pricing-data.ts`.
Ini akan mengubah data teks menjadi vektor agar bisa dicari AI.

```powershell
# Gunakan path lengkap Node.js Laragon
$env:Path += ";C:\laragon\bin\nodejs\node-v22"
npx tsx scripts/setup-rag.ts
```

*Tunggu sampai muncul pesan: ✅ Successfully inserted ... items into TiDB!*

#### 3. Jalankan Server
```powershell
# Gunakan path lengkap Node.js Laragon
$env:Path += ";C:\laragon\bin\nodejs\node-v22"
npm run dev
```

Buka **http://localhost:3000** di browser.

---

## 📁 Struktur Folder Penting

```
chatbot/
├── app/
│   ├── actions/            # Server Actions (Backend Logic)
│   │   └── chat.ts         # Logic RAG: Cari di TiDB -> Tanya AI
│   ├── lib/
│   │   ├── pricing-data.ts # Master Data Harga (sumber kebenaran)
│   │   ├── rag.ts          # Fungsi pencarian Vektor
│   │   └── tidb.ts         # Koneksi Database
│   └── components/         # UI Frontend (Chatbot, Tabel, dll)
├── scripts/
│   └── setup-rag.ts        # Script "Magic" pengisi Database Vector
├── RUN_APP.ps1             # Helper Script menjalakan aplikasi
└── README.md               # File ini
```

---

## 🆘 Troubleshooting

**Q: Terminal bilang `npm` not recognized?**
A: Gunakan `RUN_APP.ps1` atau tambahkan path manual seperti di atas.

**Q: AI menjawab "Maaf item belum ada"?**
A: Pastikan sudah menjalankan `npx tsx scripts/setup-rag.ts` agar data masuk ke database.

**Q: Error `Too Many Requests` saat setup database?**
A: Kita sudah ganti ke **Xenova (Local Embedding)**, jadi error ini tidak akan muncul lagi! Pastikan script yang dijalankan versi terbaru.

---

## 🔧 Admin API Endpoints (For Testing)

The following API endpoints are available for development and testing purposes:

### RAG Data Ingestion
To run the RAG setup script via HTTP (useful for automated testing):

```
GET /api/admin/run-script?name=setup-rag
```

**Note:** This endpoint is only available in development mode or when `ENABLE_ADMIN_SCRIPTS=true` is set in environment.

---

**© 2026 Home Putra Interior AI Project**
