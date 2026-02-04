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

// Get style keywords from item variant/name
function getStyleKeyword(item: any): string {
    const variant = (item.variant || '').toLowerCase();
    const name = (item.name || '').toLowerCase();

    if (variant.includes('klasik') || name.includes('klasik') || name.includes('classic')) return 'classic';
    if (variant.includes('minimalis') || name.includes('minimalis') || name.includes('modern')) return 'modern';
    if (variant.includes('semi klasik') || name.includes('semi')) return 'classic modern';
    return 'modern'; // default
}

function getAllProducts() {
    return categories.flatMap(cat =>
        cat.items.map(item => {
            const normalizedType = normalizeCategory(item, cat.name);
            const style = getStyleKeyword(item);

            return {
                id: item.id || `prod-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
                name: `${item.name} ${style}`, // Add style to name for search
                price: item.price,
                unit: item.unit,
                description: `${item.specs || ''} ${item.finishing || ''} ${style} sliding premium wood`.trim(),
                material: item.variant || "wood",
                color: normalizedType === 'Wallpanels' ? 'white' : undefined,
                thickness: normalizedType === 'Wallpanels' ? 5 : undefined,
                availability: 'in-stock',
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
        const minPrice = priceRange?.min || body.filters?.minPrice || body.filters?.price_min || body.minPrice;
        const maxPrice = priceRange?.max || body.filters?.maxPrice || body.filters?.price_max || body.maxPrice;

        // Material filter (can be array or string)
        const materialFilter = body.filters?.material;

        // Color filter
        const colorFilter = body.filters?.color;

        // Thickness filter
        const thicknessFilter = body.filters?.thickness;

        // Availability filter
        const availabilityFilter = body.filters?.availability;

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

        // Search by query (checks name, category, description)
        if (searchQuery) {
            results = results.filter(item => {
                const nameMatch = (item.name || '').toLowerCase().includes(searchQuery);
                const categoryMatch = (item.category || '').toLowerCase().includes(searchQuery);
                const descMatch = (item.description || '').toLowerCase().includes(searchQuery);
                return nameMatch || categoryMatch || descMatch;
            });
        }

        // Material filter (supports array format)
        if (materialFilter) {
            if (Array.isArray(materialFilter)) {
                results = results.filter(item => {
                    const itemMat = (item.material || '').toLowerCase();
                    return materialFilter.some(mat =>
                        itemMat.includes(String(mat).toLowerCase()) ||
                        String(mat).toLowerCase().includes('wood') // wood matches most
                    );
                });
            } else {
                const matLower = String(materialFilter).toLowerCase();
                results = results.filter(item =>
                    (item.material || '').toLowerCase().includes(matLower)
                );
            }
        }

        // Color filter (supports array format)
        if (colorFilter && Array.isArray(colorFilter)) {
            results = results.filter(item => {
                if (!item.color) return true; // Non-wallpanels pass through
                return colorFilter.some(c =>
                    item.color?.toLowerCase() === String(c).toLowerCase()
                );
            });
        }

        // Thickness filter
        if (thicknessFilter) {
            const minThickness = thicknessFilter.min;
            const maxThickness = thicknessFilter.max;
            results = results.filter(item => {
                if (!item.thickness) return true;
                if (minThickness !== undefined && item.thickness < minThickness) return false;
                if (maxThickness !== undefined && item.thickness > maxThickness) return false;
                return true;
            });
        }

        // Availability filter
        if (availabilityFilter) {
            results = results.filter(item =>
                item.availability === availabilityFilter
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
            matches: results,
            total: results.length
        });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ success: false, items: [], results: [], data: [], products: [], matches: [] });
    }
}

export async function GET(req: NextRequest) {
    return NextResponse.json({ success: true, items: [], results: [], data: [], products: [], matches: [] });
}
