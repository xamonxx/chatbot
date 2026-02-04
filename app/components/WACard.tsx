import React from 'react';
import { MessageCircle, ArrowRight, User, Phone, MapPin, Package } from 'lucide-react';

export default function WACard({ dataJSON }: { dataJSON: string }) {
    let data: any = {};
    try {
        data = JSON.parse(dataJSON);
    } catch {
        return null;
    }

    return (
        <div className="my-6 w-full max-w-[340px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white font-sans mx-auto md:mx-0">
            {/* Header Kuning Style Konstruksi */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-4 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-2">
                    <MessageCircle size={80} fill="white" />
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl text-white backdrop-blur-sm shadow-inner">
                        <MessageCircle size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-white text-lg leading-tight tracking-tight">KARTU ANTRIAN</h3>
                        <p className="text-white/90 text-[11px] font-medium tracking-wide">SIAP DIKIRIM KE ADMIN</p>
                    </div>
                </div>
            </div>

            {/* Body Content */}
            <div className="p-5 space-y-5">
                {/* Detail User */}
                <div>
                    <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                        <User size={10} /> Data Pemesan
                    </h4>
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-sm group">
                            <span className="text-gray-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-amber-400 transition-colors"></span>
                                Nama
                            </span>
                            <span className="font-bold text-gray-900 font-mono">{data.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm group">
                            <span className="text-gray-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-amber-400 transition-colors"></span>
                                Kontak
                            </span>
                            <span className="font-bold text-gray-900 font-mono">{data.phone}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm group">
                            <span className="text-gray-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-amber-400 transition-colors"></span>
                                Lokasi
                            </span>
                            <span className="font-bold text-gray-900 text-right max-w-[150px] truncate">{data.location}</span>
                        </div>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="border-t border-dashed border-gray-200"></div>

                {/* Info Produk (Optional) */}
                {data.product && (
                    <div>
                        <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Package size={10} /> Detail Order
                        </h4>
                        <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 flex flex-col gap-1">
                            <p className="font-bold text-gray-800 text-sm leading-snug">{data.product}</p>
                            {data.price && (
                                <p className="text-amber-600 text-xs font-bold bg-amber-100/50 self-start px-2 py-0.5 rounded-md mt-1">
                                    {data.price}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Button Hitam Tebal */}
            <div className="p-4 pt-0 pb-5">
                <a
                    href={data.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 bg-[#1e1e1e] hover:bg-black text-white font-bold py-4 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-gray-200 hover:shadow-xl group"
                >
                    <span className="tracking-wide">KONFIRMASI WHATSAPP</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
                    *Pesan otomatis akan terbuka di aplikasi WhatsApp Anda
                </p>
            </div>
        </div>
    );
}
