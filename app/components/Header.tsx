/**
 * =====================================================
 * HEADER - Komponen Header Halaman
 * =====================================================
 * Deskripsi: Header sederhana dengan judul di tengah
 * 
 * Fitur:
 * - Judul halaman di posisi tengah
 * - Desain clean dan minimalis
 * - Responsif untuk semua ukuran layar
 * 
 * Props:
 * - title: Judul yang akan ditampilkan (opsional)
 * =====================================================
 */

'use client';

// === IMPORT DEPENDENCIES ===
import { memo } from 'react';

// === TIPE PROPS ===
interface HeaderProps {
    title?: string; // Judul halaman (opsional)
}

// === KOMPONEN UTAMA ===
// Menggunakan memo untuk mencegah re-render yang tidak perlu
const Header = memo(function Header({ title }: HeaderProps) {
    return (
        <header className="flex items-center justify-center py-4 border-b border-gray-200 bg-white">
            {/* Judul halaman di tengah */}
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center justify-center gap-2">
                {title || 'Harga Dalam Kota'}
            </h1>
        </header>
    );
});

// === EXPORT ===
export default Header;
