# 📄 Product Specification: Home Putra Interior AI

**Versi Dokumen:** 1.0  
**Status:** In Development (Prototype v0.1.0)  
**Pemilik Produk:** PT. Menuju Keindahan Indonesia (Home Putra Interior)

---

## 1. 🌟 Ringkasan Eksekutif (Executive Summary)
**Home Putra Interior AI** adalah dashboard cerdas berbasis web yang dirancang untuk membantu tim penjualan dan pelanggan dalam melakukan estimasi harga, konsultasi desain, dan pemilihan material interior secara akurat.

Aplikasi ini mengatasi kelemahan chatbot konvensional dengan mengimplementasikan teknologi **RAG (Retrieval-Augmented Generation)**. Sistem ini menghubungkan kemampuan bahasa alami AI dengan database harga real-time perusahaan (TiDB Vector), memastikan setiap jawaban AI berbasis data riil, bukan halusinasi, serta memberikan estimasi budget yang presisi.

---

## 2. 🎯 Target Pengguna (Target Audience)
1.  **Konsultan Interior / Sales Tim**:
    *   Membutuhkan akses cepat ke katalog harga terbaru.
    *   Perlu membuat draft penawaran (quotation) instan untuk klien.
    *   Membutuhkan alat untuk membandingkan spesifikasi material secara teknis.
2.  **Calon Pelanggan (Homeowners)**:
    *   Mencari inspirasi dan estimasi biaya renovasi (misal: Kitchen Set, Wardrobe).
    *   Ingin konsultasi desain awal tanpa menunggu respon manual admin.

---

## 3. ⚠️ Masalah & Solusi

| Masalah (Pain Points) | Solusi (Product Features) |
| :--- | :--- |
| **Harga Berubah-ubah**: Sales sulit menghafal harga material yang dinamis. | **Real-time Pricing Engine**: Database harga terpusat yang mudah diupdate dan diakses via Chatbot. |
| **AI Halusinasi**: Chatbot biasa sering mengarang harga/spesifikasi. | **RAG Technology**: AI "dipaksa" membaca data vektor dari database sebelum menjawab pertanyaan. |
| **Respon Lambat**: Menghitung estimasi RAB butuh waktu lama jika manual. | **Instant Budgeting**: AI dapat menghitung estimasi total proyek dalam hitungan detik. |
| **Kebingungan Material**: Klien bingung bedanya HPL, Cat Duco, PVC, dll. | **Material Battle**: Fitur perbandingan *head-to-head* kelebihan dan kekurangan material. |

---

## 4. 🛠 Spesifikasi Teknis (Tech Stack)

### Core Framework
*   **Frontend**: Next.js 16 (App Router) - *Framework React modern untuk performa tinggi.*
*   **Language**: TypeScript / JavaScript.
*   **Styling**: Tailwind CSS v4 - *Utility-first CSS terbaru.*

### AI & Data Infrastructure
*   **Database**: TiDB Serverless (MySQL-Compatible) - *Menyimpan data relasional dan Vector Search dalam satu tempat.*
*   **Vector Search**: Menggunakan kapabilitas vector search bawaan TiDB.
*   **Embedding Model**: `@xenova/transformers` (Local) - *Konversi teks produk ke vektor matematika secara lokal (Gratis & Cepat).*
*   **LLM (Artificial Intelligence)**:
    *   **Provider**: Groq API.
    *   **Model**: Llama 3 (70b/8b) - *Model open-source yang sangat cepat untuk conversational AI.*

---

## 5. 📱 Fitur Utama (Functional Requirements)

### A. AI Consultant (Chatbot RAG)
*   **Input**: User bertanya dalam bahasa alami (contoh: *"Berapa estimasi harga kitchen set ukuran 3x4 meter pakai bahan PVC?"*).
*   **Proses**:
    1.  Sistem mengubah pertanyaan jadi vektor.
    2.  Mencari produk relevan di TiDB Vector Database.
    3.  Mengirim data produk + pertanyaan user ke LLM (Groq).
*   **Output**: Jawaban spesifik dengan rincian harga sesuai data perusahaan.

### B. Tabel Harga Digital (Digital Catalog)
*   Tampilan Grid/List interaktif untuk:
    *   Kitchen Set (Top Table, Kabinet Bawah/Atas).
    *   Wallpanel.
    *   Wardrobe / Lemari.
*   Fitur Pencarian & Filter Cepat.

### C. Proposal Generator
*   Fitur untuk mengubah percakapan konsultasi menjadi format teks penawaran yang rapi.
*   **One-Click Copy**: Format siap kirim ke WhatsApp pelanggan.

### D. Perbandingan Material (Material Battle)
*   Modul untuk membandingkan dua material berbeda.
*   Contoh: **PVC Board vs Multipleks**.
*   Menampilkan aspek: Ketahanan air, Harga per meter, Finishing, dan Durabilitas.

---

## 6. 🗺️ Alur Penggunaan (User Flow) - Studi Kasus RAG

1.  **Admin Update Harga**:
    *   Admin mengedit file `pricing-data.ts`.
    *   Menjalankan script `setup-rag.ts` untuk sinkronisasi ke TiDB (membuat embedding vektor baru).
2.  **User Bertanya**:
    *   User membuka web dan mengetik: *"Saya punya budget 20 juta, bisa dapat kitchen set apa?"*
3.  **Sistem Bekerja**:
    *   Sistem mencari paket harga di bawah atau sekitar 20 juta di database.
4.  **AI Menjawab**:
    *   *"Dengan budget 20 juta, Bapak/Ibu bisa mendapatkan Kitchen Set Finishing HPL (Rp X/meter) ukuran sekitar Y meter. Jika ingin upgrade ke Cat Duco, estimasi tambahannya dalah Z."*

---

## 7. 📅 Rencana Pengembangan (Roadmap & Future Improvements)

*   **v1.0 (Current)**: RAG Chatbot dasar, Tabel Harga, Kalkulasi Sederhana.
*   **v1.1**: Integrasi Upload Foto Ruangan (Vision AI) untuk saran warna.
*   **v1.2**: Login System untuk Sales (menyimpan riwayat chat per klien).
*   **v1.3**: PDF Export untuk Quotation/Penawaran Resmi dengan Kop Surat Perusahaan.
*   **v2.0**: Integrasi Payment Gateway untuk Booking Fee (Down Payment).

---

**Catatan Pengembang**:
Aplikasi ini sangat bergantung pada kualitas data di `pricing-data.ts`. Pastikan deskripsi produk mendetail agar AI (Search Vector) dapat menemukan konteks yang tepat saat user bertanya.
