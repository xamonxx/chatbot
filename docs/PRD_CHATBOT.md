# Home Putra Interior - AI Chatbot PRD

## Ringkasan Eksekutif

Home Putra Interior bergerak dari sekadar FAQ automation menuju sebuah **"Konsultan Digital"** yang benar-benar memahami aturan harga lokal dan perzona.

### Fitur Utama:
- **Sumber Harga Terintegrasi** (Master Price List, period Mei 2025) sebagai knowledge-base harga primer
- **Aturan Pengiriman & Mobilisasi** spesifik per zona (Dalam Kota vs Luar Kota)
- **Logika pemilihan harga**: otomatis memilih `dalam_kota` atau `luar_kota` berdasarkan lokasi user
- **Lead Capture**: otomatis mengekstrak data lead dalam format JSON

---

## Arsitektur Sistem

### Stack Teknologi:
- **Frontend**: Next.js + TypeScript + TailwindCSS
- **AI Model**: Groq Cloud (Llama 3.3 70B)
- **Database**: TiDB Cloud (Vector Search)
- **Channel Integration**: WhatsApp Business API (planned)

### Flow Diagram:
```
User Message → Zone Detection → RAG Search → AI Processing → Response + Lead Data
```

---

## Data Harga

### Sumber Data:
- File: `dataHargaLuarkota&dalamKota.json`
- Period: Mei 2025
- pricing_source: `master_price_list_2025`

### Kategori Produk:
1. **Kitchen Set** (meter_lari)
   - Aluminium, PVC Board, Multipleks Duco, Multipleks HPL, Blockboard, Industrial
2. **Minibar** (meter_lari)
   - Aluminium, Kayu (Blockboard/Multipleks), Components
3. **Wardrobe** (m²)
   - Aluminium, Blockboard, Multipleks, Duco
4. **Bawah Tangga** (meter_lari)
   - Aluminium, Wood-based
5. **Civil Works** (various)
   - Pengecatan, Titik Air/Listrik, Backsplash, Coran

---

## Zona & Ongkir

### Dalam Kota (Bandung & Sekitarnya):
- **Coverage**: Bandung, Cimahi, Soreang, Banjaran, Majalaya, Ciparay, Cileunyi, Jatinangor, Sumedang, Garut, Tasikmalaya
- **Ongkir**: 
  - Project < Rp 15.000.000 → Rp 500.000
  - Project ≥ Rp 15.000.000 → FREE

### Luar Kota:
- **Coverage**: Jabodetabek, Pantura, Jateng, Jatim
- **Ongkir**:
  - Project < Rp 20.000.000 → Rp 1.000.000
  - Project ≥ Rp 20.000.000 → FREE

---

## Flow Estimasi

### Chain-of-Thought:
1. **Parse Intent**: estimasi / survei / tanya material
2. **Parse Lokasi** → tentukan zona
3. **Ambil Produk & Material** (default: Multipleks HPL jika tidak disebutkan)
4. **Lookup Harga** dari master price list (sesuai zona)
5. **Hitung Estimasi**: unit × qty
6. **Buat Rentang**: ±10%
7. **Tambahkan Ongkir** jika applicable
8. **Output**: jawaban natural + lead_data JSON (jika booking)

### Contoh:
```
User: "Kitchen 3 m lurus, HPL, saya di Bintaro"
→ Zona: Luar Kota (Bintaro = Jabodetabek)
→ Produk: KS-MPX-001 (Multipleks HPL Minimalis)
→ Harga Luar Kota: Rp 2.600.000/m'
→ Estimasi: 3 × Rp 2.600.000 = Rp 7.800.000
→ Rentang: Rp 7.020.000 - Rp 8.580.000
→ Ongkir: Rp 1.000.000 (karena < Rp 20jt)
→ Total: Rp 8.020.000 - Rp 9.580.000
```

---

## Lead Data Schema

```json
{
  "intent": "booking_survey",
  "user_name": "John Doe",
  "phone_number": "08123456789",
  "location": "Bintaro",
  "zone": "luar_kota",
  "product_interest": "Kitchen Set",
  "material_preference": "Multipleks HPL",
  "unit_measure": "meter_lari",
  "quantity": 3.0,
  "estimated_price_raw": 8800000,
  "estimated_price_range": "Rp 7.920.000 - Rp 9.680.000",
  "shipping_fee": 1000000,
  "pricing_source": "master_price_list_2025",
  "escalation_required": false
}
```

---

## Rules Engine

### Aturan Estimasi:
- Kitchen Set & Minibar: `meter_lari`
- Wardrobe & Backdrop: `m²` (P × T)
- Harga selalu rentang ±10%
- Wajib disclaimer: "Harga final ditentukan setelah survei"

### Aturan Eskalasi:
- Estimasi > Rp 50.000.000 → escalate ke Sales
- Minta konfirmasi eksplisit untuk menyimpan data (UU PDP)

### Batasan Topik:
- ✅ Interior, Kitchen Set, Wardrobe, Minibar, Backdrop, Wallpanel
- ❌ Outdoor, Taman, Kolam, Konstruksi Berat

---

## Quality Metrics

- **Conversion to Survey**: Target > 15%
- **Lead JSON Validity**: Target > 95%
- **Average Response Time**: Target < 3 detik
- **Estimation Accuracy**: Target ±15% dari harga final

---

## Roadmap

1. ✅ Integrasi data harga master
2. ✅ Implementasi zone detection
3. ✅ Deploy System Prompt ke staging
4. 🔄 Pilot Jabodetabek 4 minggu
5. 📅 WhatsApp Business API integration
6. 📅 Multimodal (vision) - Fase 2

---

*Dokumen ini diupdate: 2025-02-03*
*pricing_source: master_price_list_2025*
