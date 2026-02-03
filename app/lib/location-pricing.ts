/**
 * =====================================================
 * LOCATION-PRICING.TS - Data Harga Berdasarkan Lokasi
 * =====================================================
 * Mengambil data dari dataHargaLuarkota&dalamKota.json
 * dan memformatnya untuk PriceTable component
 * =====================================================
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rawPricingData = require('../../dataHargaLuarkota&dalamKota.json');

export type LocationType = 'dalam_kota' | 'luar_kota';

export interface PriceItem {
    id: string;
    name: string;
    variant?: string;
    price: number;
    unit: string;
    finishing?: string;
    specs?: string;
    features?: string[];
    note?: string;
}

export interface PriceCategory {
    id: number;
    name: string;
    items: PriceItem[];
}

/**
 * Format angka ke format mata uang Rupiah
 */
export function formatCurrency(value: number | undefined | null): string {
    if (value === undefined || value === null) return 'Rp 0';
    if (value >= 1000000) {
        const juta = value / 1000000;
        return `Rp ${juta % 1 === 0 ? juta : juta.toFixed(1)}jt`;
    }
    return `Rp ${value.toLocaleString('id-ID')}`;
}

/**
 * Transform unit dari format JSON ke display format
 */
function formatUnit(unit: string): string {
    const unitMap: Record<string, string> = {
        'meter_lari': 'meter',
        'm2': 'm²',
        'unit': 'unit',
        'titik': 'titik'
    };
    return unitMap[unit] || unit;
}

/**
 * Parse data Kitchen Set
 */
function parseKitchenSet(data: any, location: LocationType): PriceItem[] {
    const items: PriceItem[] = [];

    // Aluminium
    if (data.alumunium) {
        data.alumunium.forEach((item: any) => {
            items.push({
                id: item.id,
                name: `Kitchen Set Aluminium ${item.type}`,
                variant: item.type,
                price: item.pricing[location],
                unit: formatUnit(item.unit),
                specs: item.specs,
                features: item.features_detail
            });
        });
    }

    // PVC Board
    if (data.pvc_board) {
        data.pvc_board.forEach((item: any) => {
            items.push({
                id: item.id,
                name: `Kitchen Set PVC Board ${item.type}`,
                variant: item.type,
                price: item.pricing[location],
                unit: formatUnit(item.unit),
                specs: item.specs,
                features: item.features_detail,
                note: item.note
            });
        });
    }

    // Multipleks Duco
    if (data.multipleks_duco) {
        data.multipleks_duco.forEach((item: any) => {
            items.push({
                id: item.id,
                name: `Kitchen Set Duco ${item.type}`,
                variant: item.type,
                price: item.pricing[location],
                unit: formatUnit(item.unit),
                specs: item.specs,
                note: item.note
            });
        });
    }

    // Multipleks HPL Grade B
    if (data.multipleks_hpl_grade_b) {
        data.multipleks_hpl_grade_b.forEach((item: any) => {
            items.push({
                id: item.id,
                name: `Kitchen Set Multipleks HPL ${item.type}`,
                variant: item.type,
                price: item.pricing[location],
                unit: formatUnit(item.unit),
                specs: item.specs,
                features: item.features_detail
            });
        });
    }

    // Blockboard Grade C
    if (data.blockboard_grade_c) {
        data.blockboard_grade_c.forEach((item: any) => {
            items.push({
                id: item.id,
                name: `Kitchen Set Blockboard ${item.type}`,
                variant: item.type,
                price: item.pricing[location],
                unit: formatUnit(item.unit),
                specs: item.specs,
                features: item.features_detail
            });
        });
    }

    // Industrial
    if (data.industrial) {
        data.industrial.forEach((item: any) => {
            items.push({
                id: item.id,
                name: `${item.category} ${item.type}`,
                variant: item.type,
                price: item.pricing[location],
                unit: formatUnit(item.unit),
                note: item.note
            });
        });
    }

    return items;
}

/**
 * Parse data Minibar
 */
function parseMinibar(data: any, location: LocationType): PriceItem[] {
    const items: PriceItem[] = [];

    // Aluminium
    if (data.alumunium) {
        data.alumunium.forEach((item: any) => {
            items.push({
                id: item.id,
                name: `Minibar Aluminium ${item.type}`,
                variant: item.type,
                price: item.pricing[location],
                unit: formatUnit(item.unit),
                specs: item.specs,
                features: item.features_detail
            });
        });
    }

    // Kayu Based
    if (data.kayu_based) {
        ['minimalis', 'semi_klasik', 'klasik'].forEach((style, idx) => {
            if (data.kayu_based[style]) {
                data.kayu_based[style].forEach((item: any) => {
                    items.push({
                        id: `MB-KAYU-${style}-${item.material}`,
                        name: `Minibar ${item.material} ${style.replace('_', ' ')}`,
                        variant: style.replace('_', ' '),
                        price: item.pricing[location],
                        unit: formatUnit(item.unit)
                    });
                });
            }
        });
    }

    // Components
    if (data.components) {
        data.components.forEach((item: any, idx: number) => {
            items.push({
                id: `MB-COMP-${idx}`,
                name: item.item,
                price: item.pricing[location],
                unit: formatUnit(item.unit)
            });
        });
    }

    return items;
}

/**
 * Parse data Wardrobe
 */
function parseWardrobe(data: any, location: LocationType): PriceItem[] {
    const items: PriceItem[] = [];

    // Aluminium
    if (data.alumunium) {
        data.alumunium.forEach((item: any) => {
            items.push({
                id: item.id,
                name: `Wardrobe Aluminium ${item.type}`,
                variant: item.type,
                price: item.pricing[location],
                unit: formatUnit(item.unit),
                features: item.features_detail,
                note: item.note
            });
        });
    }

    // Blockboard, Multipleks, Duco
    ['blockboard', 'multipleks', 'duco'].forEach((material) => {
        if (data[material]) {
            data[material].forEach((item: any) => {
                items.push({
                    id: `WR-${material.toUpperCase()}-${item.type}`,
                    name: `Wardrobe ${material.charAt(0).toUpperCase() + material.slice(1)} ${item.type}`,
                    variant: item.type,
                    price: item.pricing[location],
                    unit: formatUnit(item.unit)
                });
            });
        }
    });

    return items;
}

/**
 * Parse data Under Stairs (Bawah Tangga)
 */
function parseUnderStairs(data: any, location: LocationType): PriceItem[] {
    const items: PriceItem[] = [];

    // Aluminium
    if (data.alumunium) {
        data.alumunium.forEach((item: any) => {
            items.push({
                id: item.id,
                name: `Bawah Tangga Aluminium ${item.type}`,
                variant: item.type,
                price: item.pricing[location],
                unit: formatUnit(item.unit),
                specs: item.specs,
                features: item.features_detail
            });
        });
    }

    // Wood Based
    if (data.wood_based) {
        data.wood_based.forEach((item: any, idx: number) => {
            items.push({
                id: `LBT-WD-${idx}`,
                name: `Bawah Tangga ${item.type}`,
                variant: item.type,
                price: item.pricing[location],
                unit: formatUnit(item.unit)
            });
        });
    }

    return items;
}

/**
 * Parse data Civil Works (Pekerjaan Sipil)
 */
function parseCivilWorks(data: any, location: LocationType): PriceItem[] {
    const items: PriceItem[] = [];

    // Pengecatan
    if (data.pengecatan) {
        items.push({
            id: 'CW-CAT-1',
            name: 'Pengecatan (Jasa Saja)',
            price: data.pengecatan.jasa_saja[location],
            unit: 'm²'
        });
        items.push({
            id: 'CW-CAT-2',
            name: 'Pengecatan (Jasa + Material)',
            price: data.pengecatan.jasa_borong[location],
            unit: 'm²'
        });
    }

    // Titik
    if (data.titik) {
        items.push({
            id: 'CW-TITIK-AIR',
            name: 'Titik Air',
            price: data.titik.air[location],
            unit: 'titik'
        });
        items.push({
            id: 'CW-TITIK-LISTRIK',
            name: 'Titik Listrik',
            price: data.titik.listrik[location],
            unit: 'titik'
        });
    }

    // Backsplash
    if (data.backsplash) {
        items.push({
            id: 'CW-BS-1',
            name: 'Backsplash Bevel Biasa',
            price: data.backsplash.bevel_biasa[location],
            unit: 'meter'
        });
        items.push({
            id: 'CW-BS-2',
            name: 'Backsplash Mozaic',
            price: data.backsplash.mozaic[location],
            unit: 'meter'
        });
    }

    // Coran
    if (data.coran) {
        items.push({
            id: 'CW-COR-1',
            name: 'Coran Meja (Finish Acian)',
            price: data.coran.finish_acian[location],
            unit: 'meter'
        });
        items.push({
            id: 'CW-COR-2',
            name: 'Coran Meja (Finish Keramik)',
            price: data.coran.finish_keramik[location],
            unit: 'meter'
        });
    }

    return items;
}

/**
 * Get all pricing categories based on location
 */
export function getLocationPricing(location: LocationType): PriceCategory[] {
    const catalog = rawPricingData.catalog;
    const categories: PriceCategory[] = [];

    // 1. Kitchen Set
    if (catalog.kitchen_set) {
        categories.push({
            id: 1,
            name: 'Kitchen Set',
            items: parseKitchenSet(catalog.kitchen_set, location)
        });
    }

    // 2. Minibar
    if (catalog.minibar) {
        categories.push({
            id: 2,
            name: 'Minibar',
            items: parseMinibar(catalog.minibar, location)
        });
    }

    // 3. Wardrobe
    if (catalog.wardrobe) {
        categories.push({
            id: 3,
            name: 'Wardrobe / Lemari Pakaian',
            items: parseWardrobe(catalog.wardrobe, location)
        });
    }

    // 4. Under Stairs
    if (catalog.under_stairs) {
        categories.push({
            id: 4,
            name: 'Lemari Bawah Tangga',
            items: parseUnderStairs(catalog.under_stairs, location)
        });
    }

    // 5. Civil Works
    if (catalog.civil_works) {
        categories.push({
            id: 5,
            name: 'Pekerjaan Sipil',
            items: parseCivilWorks(catalog.civil_works, location)
        });
    }

    return categories;
}

/**
 * Get metadata
 */
export function getPricingMeta() {
    return rawPricingData.metadata;
}

/**
 * Get operational policies
 */
export function getOperationalPolicies() {
    return rawPricingData.operational_policies;
}

/**
 * catatan penting untuk harga
 */
export const importantNotes = [
    "Harga dapat berubah sewaktu-waktu tanpa pemberitahuan",
    "Harga belum termasuk ongkos kirim (lihat kebijakan pengiriman)",
    "Minimal order berlaku untuk beberapa kategori",
    "Garansi produk sesuai dengan ketentuan perusahaan"
];
