/**
 * =====================================================
 * PRICING-DATA.TS - DATA HARGA LENGKAP
 * =====================================================
 * PT. Menuju Keindahan Indonesia
 * Period: Mei 2024
 * Region: DALAM KOTA (Bandung & Jawa Barat)
 * 
 * CARA UPDATE HARGA:
 * 1. Cari kategori yang ingin diupdate
 * 2. Update field 'price' pada item yang sesuai
 * 3. Jangan lupa update 'lastUpdated' di meta
 * =====================================================
 */

// =====================================================
// METADATA
// =====================================================
export const pricingMeta = {
    companyName: "PT. Menuju Keindahan Indonesia",
    period: "Mei 2024",
    region: "Dalam Kota (Bandung & Jawa Barat)",
    lastUpdated: "2024-05-21",
    currency: "IDR"
};

// =====================================================
// INTERFACES
// =====================================================
export interface PriceItem {
    id: string;
    name: string;
    variant?: string;
    price: number;
    unit: string;
    finishing?: string;
    specs?: string;
}

export interface Category {
    id: number;
    name: string;
    note?: string;
    items: PriceItem[];
}

export interface DeliveryFee {
    condition: string;
    area: string;
    fee: number;
}

export interface RuleItem {
    title: string;
    detail: string;
    impact: string;
    costIn: number;
    costOut: number;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Format angka ke format mata uang Rupiah
 */
export function formatCurrency(value: number): string {
    if (value >= 1000000) {
        const juta = value / 1000000;
        return `Rp ${juta % 1 === 0 ? juta : juta.toFixed(1)}jt`;
    }
    return `Rp ${value.toLocaleString('id-ID')}`;
}

/**
 * Hitung selisih harga dalam kota vs luar kota
 */
export function calculateDifference(priceIn: number, priceOut: number) {
    const diff = priceOut - priceIn;
    const percent = priceIn > 0 ? Math.round((diff / priceIn) * 100) : 0;
    return {
        diff,
        percent,
        isSame: diff === 0
    };
}

/**
 * Ambil semua material unik dari data
 */
export function getAllMaterials(): string[] {
    const materials = new Set<string>();
    categories.forEach(cat => {
        cat.items.forEach(item => {
            if (item.variant) materials.add(item.variant);
        });
    });
    return Array.from(materials);
}

/**
 * Cari item berdasarkan nama/keyword
 */
export function searchItems(keyword: string): PriceItem[] {
    const results: PriceItem[] = [];
    const searchTerm = keyword.toLowerCase();

    categories.forEach(cat => {
        cat.items.forEach(item => {
            if (
                item.name.toLowerCase().includes(searchTerm) ||
                item.variant?.toLowerCase().includes(searchTerm) ||
                item.specs?.toLowerCase().includes(searchTerm)
            ) {
                results.push(item);
            }
        });
    });

    return results;
}

// =====================================================
// DATA KATEGORI PRODUK
// =====================================================

export const categories: Category[] = [
    // ─────────────────────────────────────────────────
    // KATEGORI 1: ALUMINIUM (Kitchen & Interior)
    // ─────────────────────────────────────────────────
    {
        id: 1,
        name: "Aluminium (Kitchenset & Interior)",
        items: [
            { id: "001", name: "Kitchenset Aluminium Minimalis", variant: "Grade A Non Kayu", price: 3500000, unit: "meter", finishing: "ACP Bagian Luar", specs: "ACP 4mm, Rel Double Track, Engsel Slow Motion, Rak Piring Stainless" },
            { id: "002", name: "Kitchenset Aluminium Premium", variant: "Visible Frame", price: 4500000, unit: "meter", finishing: "ACP Bagian Luar", specs: "ACP 4mm, Rel Double Track, Engsel Slow Motion, Rak Piring Stainless" },
            { id: "003", name: "Kitchenset Aluminium Semi Klasik", variant: "Visible Frame Mix PVC", price: 5000000, unit: "meter", finishing: "ACP Bagian Luar", specs: "Pintu PVC, Handle Bulat, Rel Panaci, Engsel Slow Motion" },
            { id: "004", name: "Kitchenset Aluminium Luxury", variant: "Frameless", price: 5500000, unit: "meter", finishing: "ACP Luar & Dalam", specs: "ACP 4mm, Rel Panaci, Engsel Slow Motion, Rak Piring Stainless" },
            { id: "005", name: "Minibar Aluminium Minimalis", variant: "Visible Frame", price: 4850000, unit: "meter", finishing: "ACP Luar & Dalam", specs: "Rak Bumbu, LED Strip, Engsel Slow Motion" },
            { id: "006", name: "Minibar Aluminium Luxury", variant: "Frameless", price: 5500000, unit: "meter", finishing: "ACP Luar & Dalam", specs: "Rak Bumbu, LED Strip, Engsel Slow Motion" },
            { id: "007", name: "Wardrobe Aluminium Premium", variant: "Visible Frame", price: 5000000, unit: "meter", finishing: "ACP Luar & Dalam", specs: "Lampu LED Strip/Downlight, Rel Double Track, Engsel Slow Motion" },
            { id: "008", name: "Wardrobe Aluminium Luxury", variant: "Frameless", price: 6000000, unit: "meter", finishing: "ACP Luar & Dalam", specs: "Harga Kaca Menyesuaikan Model, Lampu LED Strip, Engsel Slow Motion" },
            { id: "009", name: "Bawah Tangga Aluminium Premium", variant: "Visible Frame", price: 6000000, unit: "meter", finishing: "ACP Luar & Dalam", specs: "Lampu LED Strip, Engsel Slow Motion Stainless" },
            { id: "010", name: "Bawah Tangga Aluminium Luxury", variant: "Frameless", price: 6000000, unit: "meter", finishing: "ACP Luar & Dalam", specs: "Lampu LED Strip, Engsel Slow Motion Stainless" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 2: PVC BOARD
    // ─────────────────────────────────────────────────
    {
        id: 2,
        name: "PVC Board (Bahan Utama 18mm)",
        items: [
            { id: "011", name: "Kitchenset PVC Board Minimalis", variant: "Grade A Non Kayu", price: 4000000, unit: "meter", finishing: "HPL Luar, Melamin PVC Dalam", specs: "PVC Board 18mm, Rel Double Track, Engsel Slow Motion, Rak Piring" },
            { id: "012", name: "Kitchenset PVC Board Semi Klasik", variant: "Grade A Non Kayu", price: 4500000, unit: "meter", finishing: "HPL Luar, Melamin PVC Dalam", specs: "PVC Board 18mm, Handle Bulat, Rel Double Track, Engsel Slow Motion" },
            { id: "013", name: "Kitchenset PVC Board Klasik", variant: "Grade A Non Kayu", price: 4800000, unit: "meter", finishing: "HPL Luar, Melamin PVC Dalam", specs: "PVC Board 18mm, Desain Klasik Berprofil, Rel Double Track" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 3: MULTIPLEKS CAT DUCO
    // ─────────────────────────────────────────────────
    {
        id: 3,
        name: "Multipleks Finishing Cat Duco",
        items: [
            { id: "014", name: "Kitchenset Cat Duco Minimalis", variant: "Grade A Multipleks", price: 4500000, unit: "meter", finishing: "Duco Luar, Melaminto Dalam", specs: "Multipleks 18mm, Rel Double Track Slow Motion, Engsel Slow Motion" },
            { id: "015", name: "Kitchenset Cat Duco Semi Klasik", variant: "Grade A Multipleks", price: 4700000, unit: "meter", finishing: "Duco Luar, Melaminto Dalam", specs: "Multipleks 18mm, Rel Double Track Slow Motion, Engsel Slow Motion" },
            { id: "016", name: "Kitchenset Cat Duco Klasik", variant: "Grade A Multipleks", price: 5500000, unit: "meter", finishing: "Duco Luar, Melaminto Dalam", specs: "Multipleks 18mm, Rel Double Track Slow Motion, Engsel Slow Motion" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 4: MULTIPLEKS GRADE B (HPL)
    // ─────────────────────────────────────────────────
    {
        id: 4,
        name: "Multipleks Grade B (HPL)",
        items: [
            { id: "017", name: "Kitchenset Multipleks Minimalis", variant: "Grade B", price: 2500000, unit: "meter", finishing: "HPL Luar, Melaminto Dalam", specs: "Multipleks 18mm, Rel Double Track, Engsel Slow Motion" },
            { id: "018", name: "Kitchenset Multipleks Semi Klasik", variant: "Grade B", price: 2700000, unit: "meter", finishing: "HPL Luar, Melaminto Dalam", specs: "Multipleks 18mm, Rel Double Track, Engsel Slow Motion" },
            { id: "019", name: "Kitchenset Multipleks Klasik", variant: "Grade B", price: 3200000, unit: "meter", finishing: "HPL Luar, Melaminto Dalam", specs: "Multipleks 18mm, Desain Klasik, Rel Double Track" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 5: BLOCKBOARD GRADE C (HPL)
    // ─────────────────────────────────────────────────
    {
        id: 5,
        name: "Blockboard Grade C (HPL)",
        items: [
            { id: "020", name: "Kitchenset Blockboard Minimalis", variant: "Grade C", price: 2000000, unit: "meter", finishing: "HPL Luar, Melaminto Dalam", specs: "Blockboard 18mm, Rel Double Track, Engsel Slow Motion" },
            { id: "021", name: "Kitchenset Blockboard Semi Klasik", variant: "Grade C", price: 2500000, unit: "meter", finishing: "HPL Luar, Melaminto Dalam", specs: "Blockboard 18mm, Rel Double Track, Engsel Slow Motion" },
            { id: "022", name: "Kitchenset Blockboard Klasik", variant: "Grade C", price: 2900000, unit: "meter", finishing: "HPL Luar, Melaminto Dalam", specs: "Blockboard 18mm, Rel Double Track, Engsel Slow Motion" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 6: INDUSTRIAL KITCHENSET
    // ─────────────────────────────────────────────────
    {
        id: 6,
        name: "Industrial Kitchenset",
        note: "Harga Industrial = Harga Kabinet + Harga Rangka Besi",
        items: [
            { id: "023", name: "Kabinet Industrial Blockboard", variant: "Kabinet Saja", price: 2000000, unit: "meter", finishing: "HPL", specs: "Belum termasuk rangka besi" },
            { id: "024", name: "Kabinet Industrial Multipleks", variant: "Kabinet Saja", price: 2300000, unit: "meter", finishing: "HPL", specs: "Belum termasuk rangka besi" },
            { id: "025", name: "Kabinet Industrial Multipleks Duco", variant: "Kabinet Saja", price: 4500000, unit: "meter", finishing: "Cat Duco", specs: "Belum termasuk rangka besi" },
            { id: "026", name: "Rangka Besi Hollow", variant: "Rangka Saja", price: 1800000, unit: "meter", finishing: "Cat Besi", specs: "Rangka Besi Standard" },
            { id: "027", name: "Rangka Besi + Wire Mesh", variant: "Rangka Saja", price: 2000000, unit: "meter", finishing: "Cat Besi", specs: "Kombinasi Wire Mesh (Jaring)" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 7: MINI BAR & ISLAND (KAYU)
    // ─────────────────────────────────────────────────
    {
        id: 7,
        name: "Mini Bar & Island (Kayu)",
        items: [
            { id: "028", name: "Minibar/Island Minimalis", variant: "Blockboard", price: 2100000, unit: "meter", finishing: "HPL", specs: "Multipleks: Rp 2.500.000" },
            { id: "029", name: "Minibar/Island Semi Klasik", variant: "Blockboard", price: 2500000, unit: "meter", finishing: "HPL", specs: "Multipleks: Rp 2.700.000 (Hanya Fasad)" },
            { id: "030", name: "Minibar/Island Klasik", variant: "Blockboard", price: 2500000, unit: "meter", finishing: "HPL", specs: "Multipleks: Rp 2.700.000 (Hanya Fasad)" },
            { id: "031", name: "Topi Bar (Atap)", variant: "Blockboard", price: 1250000, unit: "meter", finishing: "HPL", specs: "Multipleks: Rp 1.450.000" },
            { id: "032", name: "Rak Terbuka / Display", variant: "Blockboard", price: 2000000, unit: "meter", finishing: "HPL", specs: "Multipleks: Rp 2.300.000" },
            { id: "033", name: "Box Elektronik (Kulkas/Dispenser)", variant: "Blockboard", price: 2100000, unit: "meter", finishing: "HPL", specs: "Multipleks: Rp 2.500.000" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 8: WARDROBE / LEMARI PAKAIAN (KAYU)
    // ─────────────────────────────────────────────────
    {
        id: 8,
        name: "Wardrobe / Lemari Pakaian (Kayu)",
        items: [
            { id: "034", name: "Wardrobe Blockboard Minimalis", variant: "Minimalis", price: 2300000, unit: "meter", finishing: "HPL", specs: "Standard 60cm" },
            { id: "035", name: "Wardrobe Blockboard Semi Klasik", variant: "Semi Klasik", price: 2700000, unit: "meter", finishing: "HPL", specs: "Standard 60cm" },
            { id: "036", name: "Wardrobe Blockboard Klasik", variant: "Klasik", price: 2950000, unit: "meter", finishing: "HPL", specs: "Standard 60cm" },
            { id: "037", name: "Wardrobe Multipleks Minimalis", variant: "Minimalis", price: 2500000, unit: "meter", finishing: "HPL", specs: "Standard 60cm" },
            { id: "038", name: "Wardrobe Multipleks Semi Klasik", variant: "Semi Klasik", price: 2750000, unit: "meter", finishing: "HPL", specs: "Standard 60cm" },
            { id: "039", name: "Wardrobe Multipleks Klasik", variant: "Klasik", price: 3000000, unit: "meter", finishing: "HPL", specs: "Standard 60cm" },
            { id: "040", name: "Wardrobe Duco Minimalis", variant: "Minimalis", price: 4800000, unit: "meter", finishing: "Cat Duco", specs: "Bahan Multipleks" },
            { id: "041", name: "Wardrobe Duco Semi Klasik", variant: "Semi Klasik", price: 5300000, unit: "meter", finishing: "Cat Duco", specs: "Bahan Multipleks" },
            { id: "042", name: "Wardrobe Duco Klasik", variant: "Klasik", price: 6300000, unit: "meter", finishing: "Cat Duco", specs: "Bahan Multipleks" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 9: MEJA RIAS
    // ─────────────────────────────────────────────────
    {
        id: 9,
        name: "Meja Rias (Dressing Table)",
        items: [
            { id: "043", name: "Meja Rias Blockboard Minimalis", variant: "Minimalis", price: 1900000, unit: "meter", finishing: "HPL" },
            { id: "044", name: "Meja Rias Blockboard Semi Klasik", variant: "Semi Klasik", price: 2200000, unit: "meter", finishing: "HPL" },
            { id: "045", name: "Meja Rias Blockboard Klasik", variant: "Klasik", price: 2400000, unit: "meter", finishing: "HPL" },
            { id: "046", name: "Meja Rias Multipleks Minimalis", variant: "Minimalis", price: 2100000, unit: "meter", finishing: "HPL" },
            { id: "047", name: "Meja Rias Multipleks Semi Klasik", variant: "Semi Klasik", price: 2450000, unit: "meter", finishing: "HPL" },
            { id: "048", name: "Meja Rias Multipleks Klasik", variant: "Klasik", price: 2600000, unit: "meter", finishing: "HPL" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 10: AREA KAMAR TIDUR
    // ─────────────────────────────────────────────────
    {
        id: 10,
        name: "Area Kamar Tidur",
        items: [
            { id: "049", name: "Dipan Blockboard", variant: "Standard", price: 2100000, unit: "meter", finishing: "HPL" },
            { id: "050", name: "Dipan Multipleks HPL", variant: "Standard", price: 2500000, unit: "meter", finishing: "HPL" },
            { id: "051", name: "Dipan Multipleks Duco", variant: "Standard", price: 3100000, unit: "meter", finishing: "Duco" },
            { id: "052", name: "Headboard Blockboard", variant: "Polos", price: 1350000, unit: "meter", finishing: "HPL", specs: "Tinggi 70cm" },
            { id: "053", name: "Headboard Multipleks", variant: "Polos", price: 1600000, unit: "meter", finishing: "HPL", specs: "Tinggi 70cm" },
            { id: "054", name: "Headboard Blockboard + Busa", variant: "Padded", price: 1850000, unit: "meter", finishing: "HPL + Busa", specs: "Tinggi 70cm" },
            { id: "055", name: "Headboard Multipleks + Busa", variant: "Padded", price: 2100000, unit: "meter", finishing: "HPL + Busa", specs: "Tinggi 70cm" },
            { id: "056", name: "Headboard Blockboard Semi Klasik", variant: "Semi Klasik", price: 1600000, unit: "meter", finishing: "HPL", specs: "Tinggi 70cm" },
            { id: "057", name: "Headboard Multipleks Semi Klasik", variant: "Semi Klasik", price: 1900000, unit: "meter", finishing: "HPL", specs: "Tinggi 70cm" },
            { id: "058", name: "Nakas Minimalis", variant: "Minimalis", price: 2500000, unit: "meter" },
            { id: "059", name: "Nakas Semi Klasik", variant: "Semi Klasik", price: 2800000, unit: "meter" },
            { id: "060", name: "Nakas Klasik", variant: "Klasik", price: 3000000, unit: "meter" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 11: DIPAN TINGKAT
    // ─────────────────────────────────────────────────
    {
        id: 11,
        name: "Rangka Dipan Tingkat",
        note: "Bagian dalam besi hollow, luar lapis HPL",
        items: [
            { id: "dipan_90", name: "Dipan Tingkat 90 x 200", price: 2000000, unit: "unit" },
            { id: "dipan_100", name: "Dipan Tingkat 100 x 200", price: 2000000, unit: "unit" },
            { id: "dipan_120", name: "Dipan Tingkat 120 x 200", price: 2250000, unit: "unit" },
            { id: "dipan_160", name: "Dipan Tingkat 160 x 200", price: 2750000, unit: "unit" },
            { id: "dipan_180", name: "Dipan Tingkat 180 x 200", price: 3000000, unit: "unit" },
            { id: "dipan_200", name: "Dipan Tingkat 200 x 200", price: 3250000, unit: "unit" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 12: AREA LIVINGROOM
    // ─────────────────────────────────────────────────
    {
        id: 12,
        name: "Area Livingroom (Backdrop, Partisi, Bench, Wallpanel)",
        items: [
            // Backdrop TV
            { id: "061", name: "Backdrop TV Blockboard Minimalis", variant: "Minimalis", price: 2100000, unit: "meter", finishing: "HPL" },
            { id: "062", name: "Backdrop TV Multipleks Minimalis", variant: "Minimalis", price: 2300000, unit: "meter", finishing: "HPL" },
            { id: "063", name: "Backdrop TV Multipleks Duco Minimalis", variant: "Minimalis", price: 4600000, unit: "meter", finishing: "Cat Duco" },
            { id: "064", name: "Backdrop TV Blockboard Semi Klasik", variant: "Semi Klasik", price: 2300000, unit: "meter", finishing: "HPL" },
            { id: "065", name: "Backdrop TV Multipleks Semi Klasik", variant: "Semi Klasik", price: 2500000, unit: "meter", finishing: "HPL" },
            { id: "066", name: "Backdrop TV Multipleks Duco Semi Klasik", variant: "Semi Klasik", price: 5100000, unit: "meter", finishing: "Cat Duco" },
            { id: "067", name: "Backdrop TV Blockboard Klasik", variant: "Klasik", price: 2500000, unit: "meter", finishing: "HPL" },
            { id: "068", name: "Backdrop TV Multipleks Klasik", variant: "Klasik", price: 2800000, unit: "meter", finishing: "HPL" },
            { id: "069", name: "Backdrop TV Multipleks Duco Klasik", variant: "Klasik", price: 6100000, unit: "meter", finishing: "Cat Duco" },
            // Partisi
            { id: "070", name: "Partisi Ruangan Blockboard Minimalis", variant: "Minimalis", price: 2100000, unit: "meter", finishing: "HPL" },
            { id: "071", name: "Partisi Ruangan Multipleks Minimalis", variant: "Minimalis", price: 2400000, unit: "meter", finishing: "HPL" },
            { id: "072", name: "Partisi Ruangan Multipleks Duco", variant: "Duco", price: 4500000, unit: "meter", finishing: "Duco" },
            { id: "073", name: "Partisi Storage Blockboard Minimalis", variant: "Storage", price: 2200000, unit: "meter", finishing: "HPL", specs: "Penyekat + Lemari" },
            { id: "074", name: "Partisi Storage Multipleks Minimalis", variant: "Storage", price: 2300000, unit: "meter", finishing: "HPL", specs: "Penyekat + Lemari" },
            { id: "075", name: "Partisi Storage Multipleks Duco", variant: "Storage", price: 4500000, unit: "meter", finishing: "Duco", specs: "Penyekat + Lemari" },
            // Bench
            { id: "076", name: "Bench Blockboard Minimalis", variant: "Minimalis", price: 2000000, unit: "meter", finishing: "HPL" },
            { id: "077", name: "Bench Multipleks Minimalis", variant: "Minimalis", price: 2200000, unit: "meter", finishing: "HPL" },
            { id: "078", name: "Bench Blockboard Semi Klasik", variant: "Semi Klasik", price: 2200000, unit: "meter", finishing: "HPL" },
            { id: "079", name: "Bench Multipleks Semi Klasik", variant: "Semi Klasik", price: 2300000, unit: "meter", finishing: "HPL" },
            { id: "080", name: "Bench Blockboard Klasik", variant: "Klasik", price: 2300000, unit: "meter", finishing: "HPL" },
            { id: "081", name: "Bench Multipleks Klasik", variant: "Klasik", price: 2500000, unit: "meter", finishing: "HPL" },
            // Wallpanel
            { id: "082", name: "Wallpanel Multipleks Minimalis", variant: "Minimalis", price: 1350000, unit: "m²", finishing: "HPL" },
            { id: "083", name: "Wallpanel Multipleks Semi Klasik", variant: "Semi Klasik", price: 1500000, unit: "m²", finishing: "HPL" },
            { id: "084", name: "Wallpanel Multipleks Klasik", variant: "Klasik", price: 1650000, unit: "m²", finishing: "HPL" },
            { id: "085", name: "Wallpanel WPC Panel", variant: "WPC", price: 850000, unit: "m²", finishing: "WPC" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 13: LEMARI BAWAH TANGGA
    // ─────────────────────────────────────────────────
    {
        id: 13,
        name: "Lemari Bawah Tangga",
        items: [
            { id: "086", name: "Bawah Tangga Blockboard Minimalis", variant: "Minimalis", price: 2300000, unit: "meter", finishing: "HPL" },
            { id: "087", name: "Bawah Tangga Multipleks Minimalis", variant: "Minimalis", price: 2500000, unit: "meter", finishing: "HPL" },
            { id: "088", name: "Bawah Tangga Blockboard Semi Klasik", variant: "Semi Klasik", price: 2700000, unit: "meter", finishing: "HPL" },
            { id: "089", name: "Bawah Tangga Multipleks Semi Klasik", variant: "Semi Klasik", price: 2750000, unit: "meter", finishing: "HPL" },
            { id: "090", name: "Bawah Tangga Blockboard Klasik", variant: "Klasik", price: 2950000, unit: "meter", finishing: "HPL" },
            { id: "091", name: "Bawah Tangga Multipleks Klasik", variant: "Klasik", price: 3000000, unit: "meter", finishing: "HPL" },
            { id: "092", name: "Bawah Tangga Duco Minimalis", variant: "Minimalis", price: 4800000, unit: "meter", finishing: "Cat Duco" },
            { id: "093", name: "Bawah Tangga Duco Semi Klasik", variant: "Semi Klasik", price: 5300000, unit: "meter", finishing: "Cat Duco" },
            { id: "094", name: "Bawah Tangga Duco Klasik", variant: "Klasik", price: 6300000, unit: "meter", finishing: "Cat Duco" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 14: ADD-ON / KACA
    // ─────────────────────────────────────────────────
    {
        id: 14,
        name: "Add-On / Tambahan (Kaca & Livingroom)",
        items: [
            { id: "add_01", name: "Kaca Polos", price: 650000, unit: "m²" },
            { id: "add_02", name: "Cermin Biasa", price: 750000, unit: "m²" },
            { id: "add_03", name: "Kaca Riben", price: 1250000, unit: "m²" },
            { id: "add_04", name: "Cermin Bronze / Grey", price: 1850000, unit: "m²" },
            { id: "add_05", name: "Tambahan Busa Bench", price: 650000, unit: "meter" },
            { id: "add_06", name: "Cermin Wallpanel Biasa (Bevel)", price: 1850000, unit: "m²" },
            { id: "add_07", name: "Cermin Wallpanel Bronze/Grey (Bevel)", price: 1950000, unit: "m²" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 15: AKSESORIS SATUAN
    // ─────────────────────────────────────────────────
    {
        id: 15,
        name: "Aksesoris Satuan",
        items: [
            { id: "acc_01", name: "Lampu Down Light", price: 85000, unit: "pcs" },
            { id: "acc_02", name: "Lampu LED Strip", price: 100000, unit: "meter" },
            { id: "acc_03", name: "Rak Bumbu Kayu", price: 400000, unit: "pcs" },
            { id: "acc_04", name: "Rel Panci", price: 300000, unit: "pcs" },
            { id: "acc_05", name: "Rel Gas & Ventilasi", price: 300000, unit: "pcs" },
            { id: "acc_06", name: "Ventilasi Aluminium", price: 50000, unit: "pcs" },
            { id: "acc_07", name: "Rak Piring Bawah (Line 2 susun)", price: 350000, unit: "pcs" },
            { id: "acc_08", name: "Tangga Lipat Kabinet Bawah", price: 2500000, unit: "pcs" },
            { id: "acc_09", name: "Rak Sudut Revolve Basket (Full/270)", price: 2500000, unit: "pcs" },
            { id: "acc_10", name: "Rak Sudut Revolve Basket (Half/180)", price: 1350000, unit: "pcs" },
            { id: "acc_11", name: "Rak Pantry Stainless (Tall Unit)", price: 7300000, unit: "pcs" },
            { id: "acc_12", name: "Rak Piring Elevator 60cm", price: 3700000, unit: "pcs" },
            { id: "acc_13", name: "Rak Piring Elevator 70cm", price: 4700000, unit: "pcs" },
            { id: "acc_14", name: "Rak Piring Elevator 80cm", price: 4915000, unit: "pcs" },
            { id: "acc_15", name: "Rak Piring Elevator 90cm", price: 5120000, unit: "pcs" },
            { id: "acc_16", name: "Engsel Pintu Aventos (Bifo-125G)", price: 1100000, unit: "pcs" },
            { id: "acc_17", name: "Tarikan Edging Stainless", price: 150000, unit: "meter" },
            { id: "acc_18", name: "Tarikan Keong", price: 45000, unit: "pcs" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 16: UPGRADE HARDWARE & MATERIAL
    // ─────────────────────────────────────────────────
    {
        id: 16,
        name: "Upgrade Hardware & Material",
        items: [
            { id: "up_01", name: "Upgrade Finishing HPL Dalam", price: 700000, unit: "meter" },
            { id: "up_02", name: "Upgrade Engsel Stainless", price: 75000, unit: "pasang" },
            { id: "up_03", name: "Upgrade Rel Tandem Slow Motion", price: 450000, unit: "pasang" },
            { id: "up_04", name: "Upgrade Rel Slowmotion Biasa", price: 150000, unit: "pasang" },
            { id: "up_05", name: "Upgrade Rak Piring Bawah Stainless", price: 650000, unit: "pcs" },
            { id: "up_06", name: "Upgrade Rak Piring Atas Stainless", price: 450000, unit: "pcs" }
        ]
    },

    // ─────────────────────────────────────────────────
    // KATEGORI 17: PEKERJAAN SIPIL
    // ─────────────────────────────────────────────────
    {
        id: 17,
        name: "Pekerjaan Sipil",
        items: [
            { id: "civ_01", name: "Pengecatan (Jasa Saja)", price: 90000, unit: "m²" },
            { id: "civ_02", name: "Pengecatan (Jasa Borong)", price: 125000, unit: "m²" },
            { id: "civ_03", name: "Pindah Titik Air", price: 450000, unit: "meter" },
            { id: "civ_04", name: "Pindah Titik Listrik", price: 650000, unit: "meter" },
            { id: "civ_05", name: "Pasang Back Splash Bevel Biasa", price: 1050000, unit: "meter" },
            { id: "civ_06", name: "Pasang Back Splash Bevel Model", price: 1150000, unit: "meter" },
            { id: "civ_07", name: "Pasang Back Splash Mozaic", price: 1500000, unit: "meter" },
            { id: "civ_08", name: "Bikin Coran Meja Beton (Acian)", price: 1900000, unit: "meter" },
            { id: "civ_09", name: "Bikin Coran Meja Beton (Keramik)", price: 2400000, unit: "meter" },
            { id: "civ_10", name: "Wall Moulding", price: 350000, unit: "keliling" },
            { id: "civ_11", name: "Bobok Lubang (Kompor/Sink)", price: 750000, unit: "lubang" },
            { id: "civ_12", name: "Bongkar Coran (< 5m)", price: 1750000, unit: "paket" },
            { id: "civ_13", name: "Bongkar Back Splash (0-5m)", price: 1750000, unit: "paket" },
            { id: "civ_14", name: "Bongkar Kabinet (0-3m)", price: 2000000, unit: "paket" },
            { id: "civ_15", name: "Bongkar Kabinet (3-5m)", price: 2750000, unit: "paket" },
            { id: "civ_16", name: "Bongkar Kabinet (> 5m)", price: 3250000, unit: "paket" },
            { id: "civ_17", name: "Bongkar Keramik Lantai", price: 350000, unit: "m²" },
            { id: "civ_18", name: "Pasang Keramik Lantai", price: 650000, unit: "m²" },
            { id: "civ_19", name: "Decking", price: 2500000, unit: "m²" },
            { id: "civ_20", name: "Rumput Sintetis", price: 1500000, unit: "m²" },
            { id: "civ_21", name: "Vinyl Lem", price: 850000, unit: "m²" },
            { id: "civ_22", name: "Vinyl Click", price: 950000, unit: "m²" }
        ]
    }
];

// =====================================================
// BIAYA PENGIRIMAN
// =====================================================
export const deliveryFees: DeliveryFee[] = [
    { condition: "Project < Rp 15.000.000", area: "Bandung & Sekitarnya", fee: 500000 },
    { condition: "Project < Rp 20.000.000", area: "Jabodetabek, Pantura, Jatim, Jateng", fee: 1000000 }
];

// =====================================================
// CATATAN PENTING
// =====================================================
export const importantNotes: string[] = [
    "Project < Rp 10.000.000 tidak termasuk Rak Piring, Rak Bumbu, Rak Sendok.",
    "Harga Industrial = Harga Kabinet + Harga Rangka Besi (dihitung terpisah).",
    "Harga Lemari/Wardrobe dan Meja Rias dihitung dengan kedalaman standard 60cm.",
    "Tinggi Headboard standard 70cm.",
    "Harga Cermin Wallpanel menggunakan finishing Bevel.",
    "Harga sudah termasuk pemasangan untuk area Dalam Kota.",
    "GRATIS Survey & Konsultasi Desain 3D."
];

// =====================================================
// ATURAN & SYARAT (UNTUK RULES PANEL)
// =====================================================
export const rules: RuleItem[] = [
    {
        title: "Minimum Order (Dalam Kota)",
        detail: "Project di bawah Rp 15 Juta dikenakan biaya tambahan",
        impact: "Charge Rp 500.000",
        costIn: 500000,
        costOut: 1000000
    },
    {
        title: "Minimum Order (Luar Kota)",
        detail: "Project di bawah Rp 20 Juta dikenakan biaya tambahan",
        impact: "Charge Rp 1.000.000",
        costIn: 500000,
        costOut: 1000000
    },
    {
        title: "Survey & Desain 3D",
        detail: "Konsultasi, pengukuran, dan gambar 3D",
        impact: "GRATIS (Included)",
        costIn: 0,
        costOut: 0
    },
    {
        title: "Rak Piring & Aksesoris",
        detail: "Project < Rp 10 Juta tidak include Rak Piring, Rak Bumbu, Rak Sendok",
        impact: "Aksesoris dihitung terpisah",
        costIn: 0,
        costOut: 0
    }
];

// =====================================================
// QUICK ACCESS - ITEM POPULER
// =====================================================
export const popularItems = {
    // Kitchen Set
    kitchenAluminiumMinimalis: categories[0].items[0],
    kitchenAluminiumPremium: categories[0].items[1],
    kitchenAluminiumLuxury: categories[0].items[3],
    kitchenMultipleks: categories[3].items[0],
    kitchenBlockboard: categories[4].items[0],

    // Wallpanel
    wallpanelMinimalis: categories[11].items.find(i => i.id === "082"),
    wallpanelWPC: categories[11].items.find(i => i.id === "085"),

    // Wardrobe
    wardrobeBlockboard: categories[7].items[0],
    wardrobeMultipleks: categories[7].items[3]
};

// =====================================================
// LEGACY EXPORT (Untuk kompatibilitas)
// =====================================================
export const pricingData = {
    kitchen: categories[0].items.map(item => ({
        item: item.name,
        spec: item.specs || item.finishing || "",
        priceIn: item.price,
        priceOut: item.price, // Dalam kota sama dengan luar kota untuk sementara
        unit: `/${item.unit}`,
        note: item.variant || ""
    })),
    wallpanel: categories[11].items.filter(i => i.name.includes("Wallpanel")).map(item => ({
        item: item.name,
        spec: item.finishing || "",
        priceIn: item.price,
        priceOut: item.price,
        unit: `/${item.unit}`,
        note: item.variant || ""
    })),
    rules: rules
};
