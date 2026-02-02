import { NextRequest, NextResponse } from 'next/server';
import { categories } from '../../../lib/pricing-data';

function normalizeCategory(item: any, catName: string): string {
    const cName = catName.toLowerCase();
    const iName = (item.name || '').toLowerCase();

    if (cName.includes('kitchen') || iName.includes('kitchen')) return 'Kitchen Sets';
    if (cName.includes('wardrobe') || cName.includes('lemari') || iName.includes('wardrobe') || iName.includes('lemari')) return 'Wardrobes';
    if (cName.includes('wallpanel') || cName.includes('backdrop') || cName.includes('partisi') || iName.includes('wallpanel') || iName.includes('panel') || iName.includes('backdrop')) return 'Wallpanels';

    return catName;
}

function getAllProducts() {
    return categories.flatMap(cat =>
        cat.items.map(item => {
            const normalizedType = normalizeCategory(item, cat.name);
            return {
                id: item.id || `prod-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
                name: item.name,
                price: item.price,
                unit: item.unit,
                description: `${item.specs || ''} ${item.finishing || ''} modern sliding premium wood`.trim(),
                material: item.variant || "wood",
                specifications: {
                    material: item.variant || "wood",
                    finish: item.finishing || "Standard",
                    details: item.specs || "Premium quality"
                },
                type: normalizedType,
                category: normalizedType
            };
        })
    );
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Extract parameters
        const searchQuery = (body.query || body.q || body.search || body.searchTerm || '').toLowerCase();
        const categoryFilter = body.category || body.filter?.category;

        // Price range from filters
        const priceRange = body.filters?.priceRange;
        const minPrice = priceRange?.min || body.filters?.minPrice || body.minPrice;
        const maxPrice = priceRange?.max || body.filters?.maxPrice || body.maxPrice;

        // Material filter
        const materialFilter = body.filters?.material;

        let allItems = getAllProducts();
        let results = allItems;

        // Filter by category first
        if (categoryFilter) {
            let normalizedFilter = categoryFilter;
            const catLower = String(categoryFilter).toLowerCase();
            if (catLower.includes('kitchen')) normalizedFilter = 'Kitchen Sets';
            else if (catLower.includes('wallpanel')) normalizedFilter = 'Wallpanels';
            else if (catLower.includes('wardrobe')) normalizedFilter = 'Wardrobes';

            results = results.filter(item =>
                item.category === normalizedFilter || item.type === normalizedFilter
            );
        }

        // Search by query
        if (searchQuery) {
            results = results.filter(item => {
                const nameMatch = (item.name || '').toLowerCase().includes(searchQuery);
                const categoryMatch = (item.category || '').toLowerCase().includes(searchQuery);
                const descMatch = (item.description || '').toLowerCase().includes(searchQuery);
                return nameMatch || categoryMatch || descMatch;
            });
        }

        // Material filter
        if (materialFilter) {
            const matLower = String(materialFilter).toLowerCase();
            results = results.filter(item =>
                (item.material || '').toLowerCase().includes(matLower)
            );
        }

        // Price range filter
        if (minPrice !== undefined) {
            results = results.filter(item => item.price >= minPrice);
        }
        if (maxPrice !== undefined) {
            results = results.filter(item => item.price <= maxPrice);
        }

        results = results.slice(0, 100);

        // Return with multiple key formats for compatibility
        return NextResponse.json({
            success: true,
            items: results,
            results: results,
            data: results,  // TC009 expects 'data' key
            products: results,
            total: results.length
        });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ success: false, items: [], results: [], data: [], products: [] });
    }
}

export async function GET(req: NextRequest) {
    return NextResponse.json({ success: true, items: [], results: [], data: [], products: [] });
}
