/**
 * =====================================================
 * ZONE-PRICING.TS - Logika Zona & Ongkir
 * =====================================================
 * Menentukan zona harga berdasarkan lokasi user
 * dan menghitung biaya pengiriman
 * =====================================================
 */

export type ZoneType = 'dalam_kota' | 'luar_kota';

// Daftar area Dalam Kota (Bandung & Sekitarnya)
const DALAM_KOTA_AREAS = [
    'bandung', 'bandung barat', 'bandung timur', 'bandung selatan', 'bandung utara',
    'kab bandung', 'kota bandung', 'cimahi', 'soreang', 'banjaran', 'majalaya',
    'ciparay', 'cileunyi', 'jatinangor', 'sumedang', 'garut',
    'tasikmalaya', 'lembang', 'ciwidey', 'pangalengan',
    'rancaekek', 'bojongsoang', 'dayeuhkolot', 'margahayu',
    'katapang', 'margaasih', 'cimenyan', 'cilengkrang',
    'padalarang', 'ngamprah', 'cikalong wetan', 'cililin', 'batujajar',
    'cianjur', 'sukabumi'
];

// Daftar area Luar Kota (Jabodetabek, Pantura, Jateng, Jatim)
const LUAR_KOTA_AREAS = [
    // Jabodetabek
    'jakarta', 'bogor', 'depok', 'tangerang', 'bekasi',
    'bintaro', 'bsd', 'serpong', 'pondok indah', 'kelapa gading',
    'cibubur', 'sentul', 'cikarang', 'karawang', 'purwakarta',
    // Pantura
    'cirebon', 'indramayu', 'subang', 'majalengka', 'kuningan',
    // Jawa Tengah
    'semarang', 'solo', 'jogja', 'yogyakarta', 'pekalongan',
    'tegal', 'brebes', 'purwokerto', 'cilacap',
    // Jawa Timur
    'surabaya', 'malang', 'sidoarjo', 'gresik', 'mojokerto'
];

/**
 * Menentukan zona berdasarkan lokasi user
 */
export function detectZone(location: string): ZoneType | null {
    if (!location) return null;

    const normalizedLocation = location.toLowerCase().trim();

    // Check Dalam Kota first
    for (const area of DALAM_KOTA_AREAS) {
        if (normalizedLocation.includes(area)) {
            return 'dalam_kota';
        }
    }

    // Check Luar Kota
    for (const area of LUAR_KOTA_AREAS) {
        if (normalizedLocation.includes(area)) {
            return 'luar_kota';
        }
    }

    // If not found in either list, return null (need to ask user)
    return null;
}

/**
 * Menghitung ongkir berdasarkan zona dan total project
 */
export function calculateShippingFee(zone: ZoneType, projectTotal: number): number {
    if (zone === 'dalam_kota') {
        // Dalam Kota: < 15jt = 500k, >= 15jt = FREE
        return projectTotal < 15000000 ? 500000 : 0;
    } else {
        // Luar Kota: < 20jt = 1jt, >= 20jt = FREE
        return projectTotal < 20000000 ? 1000000 : 0;
    }
}

/**
 * Format zona untuk display
 */
export function formatZoneDisplay(zone: ZoneType): string {
    return zone === 'dalam_kota' ? 'Dalam Kota (Bandung & Sekitarnya)' : 'Luar Kota';
}

/**
 * Cek apakah perlu eskalasi ke sales (total > 50jt)
 */
export function requiresEscalation(totalEstimate: number): boolean {
    return totalEstimate > 50000000;
}

/**
 * Hitung rentang harga (±10%)
 */
export function calculatePriceRange(basePrice: number): { low: number; high: number } {
    return {
        low: Math.round(basePrice * 0.9),
        high: Math.round(basePrice * 1.1)
    };
}

/**
 * Format harga ke Rupiah
 */
export function formatRupiah(value: number): string {
    return `Rp ${value.toLocaleString('id-ID')}`;
}

/**
 * Format rentang harga ke string
 */
export function formatPriceRange(low: number, high: number): string {
    return `${formatRupiah(low)} - ${formatRupiah(high)}`;
}

/**
 * Interface untuk Lead Data
 */
export interface LeadData {
    intent: 'estimation' | 'booking_survey' | 'inquiry' | 'material_question';
    user_name?: string;
    phone_number?: string;
    location?: string;
    zone: ZoneType;
    product_interest: string;
    material_preference: string;
    unit_measure: 'meter_lari' | 'm2' | 'unit';
    quantity: number;
    estimated_price_raw: number;
    estimated_price_range: string;
    shipping_fee: number;
    pricing_source: 'master_price_list_2025';
    escalation_required: boolean;
    timestamp?: string;
}

/**
 * Build Lead Data JSON
 */
export function buildLeadData(params: {
    intent: LeadData['intent'];
    location: string;
    zone: ZoneType;
    product: string;
    material: string;
    unit: 'meter_lari' | 'm2' | 'unit';
    quantity: number;
    pricePerUnit: number;
    userName?: string;
    phoneNumber?: string;
}): LeadData {
    const baseTotal = params.pricePerUnit * params.quantity;
    const shippingFee = calculateShippingFee(params.zone, baseTotal);
    const totalWithShipping = baseTotal + shippingFee;
    const range = calculatePriceRange(totalWithShipping);

    return {
        intent: params.intent,
        user_name: params.userName,
        phone_number: params.phoneNumber,
        location: params.location,
        zone: params.zone,
        product_interest: params.product,
        material_preference: params.material,
        unit_measure: params.unit,
        quantity: params.quantity,
        estimated_price_raw: totalWithShipping,
        estimated_price_range: formatPriceRange(range.low, range.high),
        shipping_fee: shippingFee,
        pricing_source: 'master_price_list_2025',
        escalation_required: requiresEscalation(totalWithShipping),
        timestamp: new Date().toISOString()
    };
}

/**
 * Get zone info summary
 */
export function getZoneInfo(zone: ZoneType): {
    freeShippingThreshold: number;
    shippingFee: number;
    areas: string[];
} {
    if (zone === 'dalam_kota') {
        return {
            freeShippingThreshold: 15000000,
            shippingFee: 500000,
            areas: DALAM_KOTA_AREAS
        };
    }
    return {
        freeShippingThreshold: 20000000,
        shippingFee: 1000000,
        areas: LUAR_KOTA_AREAS
    };
}
