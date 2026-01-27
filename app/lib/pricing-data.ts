/**
 * =====================================================
 * PRICING-DATA.TS - DATA HARGA
 * =====================================================
 * Deskripsi: File berisi semua data harga produk interior
 * Data ini diambil dari PDF Price List resmi perusahaan
 * Dibagi menjadi: Kitchen, Wallpanel, dan Rules
 * =====================================================
 */

/**
 * Interface untuk item harga
 * Mendefinisikan struktur data setiap produk
 */
export interface PriceItem {
    item: string;        // Nama produk
    spec: string;        // Spesifikasi teknis
    priceIn: number;     // Harga dalam kota (Rupiah)
    priceOut: number;    // Harga luar kota (Rupiah)
    unit: string;        // Satuan harga (/m, /m², dll)
    note: string;        // Catatan tambahan
}

/**
 * Interface untuk aturan/syarat
 * Mendefinisikan struktur data setiap aturan bisnis
 */
export interface RuleItem {
    title: string;       // Judul aturan
    detail: string;      // Detail/deskripsi aturan
    impact: string;      // Dampak dari aturan ini
    costIn: number;      // Biaya dalam kota (Rupiah)
    costOut: number;     // Biaya luar kota (Rupiah)
}

/**
 * Interface untuk keseluruhan data harga
 * Menggabungkan semua kategori produk
 */
export interface PricingDataType {
    kitchen: PriceItem[];    // Data kitchen set
    wallpanel: PriceItem[];  // Data wallpanel
    rules: RuleItem[];       // Aturan & syarat
}

/**
 * =====================================================
 * DATA HARGA PRODUK
 * =====================================================
 * Sumber: PDF Price List Dalam Kota & Luar Kota
 * Update: Mei 2024/2025
 * =====================================================
 */
export const pricingData: PricingDataType = {
    /**
     * DATA KITCHEN SET
     * Harga kitchen set berbagai material
     */
    kitchen: [
        {
            // Kitchen Set Aluminium - Material premium, tahan lama
            item: "Kitchen Set Aluminium (Standard)",
            spec: "Bahan ACP 4mm, Rell Double Track, Engsel Slow Motion",
            priceIn: 3500000,   // Rp 3.5 juta/meter (dalam kota)
            priceOut: 3500000,  // Rp 3.5 juta/meter (luar kota) - FLAT!
            unit: "/m¹",        // Satuan per meter lari
            note: "Harga relatif stabil di kedua area. Sudah termasuk: Rak Piring Stainless, Rak Sendok, Rak Bumbu, LED Strip."
        },
        {
            // Kitchen Set Multipleks - Opsi ekonomis
            item: "Kitchen Set Multipleks (Standard)",
            spec: "Finishing HPL, Engsel Slow Motion",
            priceIn: 2100000,   // Rp 2.1 juta/meter (dalam kota)
            priceOut: 2600000,  // Rp 2.6 juta/meter (luar kota)
            unit: "/m¹",        // Satuan per meter lari
            note: "Harga Multipleks bervariasi tergantung finishing. Selisih ~24% untuk luar kota."
        }
    ],

    /**
     * DATA WALLPANEL & DEKORASI
     * Berbagai tipe wallpanel dan cermin
     */
    wallpanel: [
        {
            // Wallpanel Minimalis - Desain simple & modern
            item: "Wallpanel Minimalis",
            spec: "Multipleks, Finishing HPL/Duco Grade B",
            priceIn: 1350000,   // Rp 1.35 juta/m² (dalam kota)
            priceOut: 1350000,  // Rp 1.35 juta/m² (luar kota) - SAMA!
            unit: "/m²",        // Satuan per meter persegi
            note: "Harga dasar sama untuk kedua area."
        },
        {
            // Wallpanel Semi Klasik - Dengan list profil
            item: "Wallpanel Semi Klasik",
            spec: "Multipleks, List Profil",
            priceIn: 1500000,   // Rp 1.5 juta/m² (dalam kota)
            priceOut: 1500000,  // Rp 1.5 juta/m² (luar kota) - SAMA!
            unit: "/m²",
            note: "Harga dasar sama, cocok untuk ruang makan & living room."
        },
        {
            // Wallpanel Klasik - Premium dengan detailing rumit
            item: "Wallpanel Klasik",
            spec: "Multipleks, Profil Rumit, Cat Duco",
            priceIn: 1650000,   // Rp 1.65 juta/m² (dalam kota)
            priceOut: 1850000,  // Rp 1.85 juta/m² (luar kota) - NAIK!
            unit: "/m²",
            note: "SELISIH TINGGI! Luar kota lebih mahal Rp 200rb/m² karena waktu instalasi lebih lama."
        },
        {
            // WPC Panel - Material composite modern
            item: "WPC Panel (Kisi-kisi)",
            spec: "Bahan WPC (Wood Plastic Composite)",
            priceIn: 850000,    // Rp 850rb/m² (dalam kota)
            priceOut: 950000,   // Rp 950rb/m² (luar kota) - NAIK!
            unit: "/m²",
            note: "Luar kota lebih mahal Rp 100rb/m² karena volume pengiriman besar."
        },
        {
            // Cermin Biasa - Add-on dekoratif
            item: "Cermin Biasa (Add-on)",
            spec: "Finishing Bevel",
            priceIn: 1850000,   // Rp 1.85 juta/m² (dalam kota)
            priceOut: 1850000,  // Rp 1.85 juta/m² (luar kota) - SAMA!
            unit: "/m²",
            note: "Harga stabil, bagus untuk memperluas kesan ruangan."
        }
    ],

    /**
     * ATURAN & SYARAT BISNIS
     * Ketentuan minimum order, biaya tambahan, dll
     */
    rules: [
        {
            // Aturan Minimum Order
            title: "Minimum Order (Project Kecil)",
            detail: "Project di bawah Rp 15 Juta (Dalam Kota) / Rp 20 Juta (Luar Kota)",
            impact: "Dikenakan Biaya Tambahan (Charge)",
            costIn: 500000,     // Charge Rp 500rb untuk dalam kota
            costOut: 1000000    // Charge Rp 1 juta untuk luar kota
        },
        {
            // Survey & Desain gratis
            title: "Biaya Survey & Desain",
            detail: "Survey Lokasi & Gambar 3D",
            impact: "GRATIS (Included)",
            costIn: 0,          // Gratis dalam kota
            costOut: 0          // Gratis luar kota juga!
        }
    ]
};

/**
 * Helper function: Format mata uang Rupiah
 * Mengubah angka menjadi format "Rp X.XXX.XXX"
 * 
 * @param value - Angka yang akan diformat
 * @returns String dalam format mata uang Indonesia
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0  // Tanpa desimal
    }).format(value);
};

/**
 * Helper function: Hitung persentase selisih harga
 * Menghitung perbedaan harga antara dalam & luar kota
 * 
 * @param priceIn - Harga dalam kota
 * @param priceOut - Harga luar kota
 * @returns Object dengan {diff: selisih, percent: persentase}
 */
export const calculateDifference = (priceIn: number, priceOut: number) => {
    if (priceIn === priceOut) {
        return { diff: 0, percent: 0, isSame: true };
    }
    const diff = priceOut - priceIn;
    const percent = ((diff / priceIn) * 100).toFixed(1);
    return { diff, percent: parseFloat(percent), isSame: false };
};

/**
 * Helper function: Dapatkan semua item material
 * Menggabungkan data kitchen dan wallpanel untuk dropdown
 * 
 * @returns Array semua material yang tersedia
 */
export const getAllMaterials = (): PriceItem[] => {
    return [...pricingData.kitchen, ...pricingData.wallpanel];
};
