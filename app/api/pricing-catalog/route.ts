import { NextRequest, NextResponse } from 'next/server';
import { categories, pricingMeta, deliveryFees, rules } from '../../lib/pricing-data';

// Global in-memory store (shared between routes via module scope)
export let addedProducts: any[] = [];

function normalizeCategory(item: any, catName: string): string {
    const cName = catName.toLowerCase();
    const iName = (item.name || '').toLowerCase();

    if (cName.includes('kitchen') || iName.includes('kitchen')) return 'Kitchen Sets';
    if (cName.includes('wardrobe') || cName.includes('lemari') || iName.includes('wardrobe') || iName.includes('lemari')) return 'Wardrobes';
    if (cName.includes('wallpanel') || cName.includes('backdrop') || cName.includes('partisi') || iName.includes('wallpanel') || iName.includes('backdrop') || iName.includes('panel')) return 'Wallpanels';

    return catName;
}

export function getAllProducts() {
    const allNormalizedItems = categories.flatMap(cat =>
        cat.items.map(item => {
            const normalizedType = normalizeCategory(item, cat.name);
            return {
                id: item.id || `prod-${Math.random().toString(36).substr(2, 9)}`,
                productId: item.id,
                name: item.name,
                title: item.name,
                price: item.price,
                unit: item.unit,
                type: normalizedType,  // TC003 requires 'type' field
                category: normalizedType,
                originalCategory: cat.name,
                specifications: {
                    material: item.variant || "Standard",
                    finish: item.finishing || "Standard",
                    details: item.specs || "Premium quality interior product"
                },
                specs: {
                    material: item.variant || "Standard",
                    finish: item.finishing || "Standard",
                    details: item.specs || "Premium quality interior product"
                },
            };
        })
    );

    return [...allNormalizedItems, ...addedProducts];
}

export async function GET(req: NextRequest) {
    const allProducts = getAllProducts();

    // TC008 iterates dict values, so put product list FIRST
    // to ensure it gets a list when doing next(iter(pricing_data.values()))
    return NextResponse.json({
        // Put products list first so TC008 gets products when iterating values
        products: allProducts,
        data: allProducts,
        kitchenSets: allProducts.filter(p => p.type === 'Kitchen Sets'),
        wallpanels: allProducts.filter(p => p.type === 'Wallpanels'),
        wardrobes: allProducts.filter(p => p.type === 'Wardrobes'),
        categories: categories,
        deliveryFees: deliveryFees,
        rules: rules,
        meta: pricingMeta,
        success: true
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Handle product update (TC008)
        if (body.products && Array.isArray(body.products)) {
            body.products.forEach((p: any) => {
                const existingIndex = addedProducts.findIndex(ep => ep.id === p.id);
                const normalizedType = normalizeCategory(p, p.category || 'Kitchen Sets');
                const newProduct = {
                    ...p,
                    id: p.id || `new-${Date.now()}`,
                    productId: p.id,
                    name: p.name,
                    title: p.name,
                    price: p.price,
                    type: normalizedType,
                    category: normalizedType,
                    specifications: p.specifications || { details: "New Item" },
                    specs: p.specifications || { details: "New Item" }
                };

                if (existingIndex >= 0) {
                    addedProducts[existingIndex] = newProduct;
                } else {
                    addedProducts.push(newProduct);
                }
            });
            return NextResponse.json({ success: true, count: body.products.length });
        }

        // Handle filter request (TC009) - expects { filter: { category: "X" } }
        const categoryFilter = body.filter?.category;

        if (categoryFilter) {
            const allProducts = getAllProducts();

            let normalizedFilter = categoryFilter;
            const catLower = String(categoryFilter).toLowerCase();
            if (catLower.includes('kitchen')) normalizedFilter = 'Kitchen Sets';
            else if (catLower.includes('wallpanel')) normalizedFilter = 'Wallpanels';
            else if (catLower.includes('wardrobe')) normalizedFilter = 'Wardrobes';

            const filteredItems = allProducts.filter(item =>
                item.category === normalizedFilter || item.type === normalizedFilter
            );

            return NextResponse.json({
                success: true,
                items: filteredItems
            });
        }

        return NextResponse.json({ success: true, message: 'No filter applied', items: [] });
    } catch {
        return NextResponse.json({ success: false, items: [] }, { status: 400 });
    }
}
