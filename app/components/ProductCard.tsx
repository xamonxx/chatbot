
import React from 'react';
import { Package, Check, ArrowRight, Tag } from 'lucide-react';

interface ProductData {
    name: string;
    price: string;
    unit: string;
    description: string;
    tags?: string[];
}

interface ProductCardProps {
    dataJSON: string;
}

export default function ProductCard({ dataJSON }: ProductCardProps) {
    let product: ProductData;

    try {
        product = JSON.parse(dataJSON);
    } catch (e) {
        return <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">Gagal menampilkan kartu produk.</div>;
    }

    return (
        <div className="my-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 w-full max-w-[95%] md:max-w-md mx-auto">
            {/* Header / Gradient Placeholder for Image */}
            <div className="h-24 bg-gradient-to-br from-amber-400 to-orange-400 relative flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                    <Package className="text-white w-8 h-8" strokeWidth={1.5} />
                </div>

                {/* Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <Tag size={10} />
                    Rekomendasi
                </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-5">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {product.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-amber-600 tracking-tight">{product.price}</span>
                    <span className="text-sm text-gray-400 font-medium">{product.unit || '/unit'}</span>
                </div>

                {/* Features Tags */}
                {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {product.tags.map((tag, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-gray-50 text-gray-600 px-2 py-1 rounded-md text-[11px] font-medium border border-gray-100">
                                <Check size={10} className="text-green-500" />
                                {tag}
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Button */}
                <button className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 group">
                    Pilih Produk Ini
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}
