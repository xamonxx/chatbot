

import { dbRequest } from "./tidb";
import { pipeline } from '@xenova/transformers';

// Lazy load extractor agar server tidak crash saat startup
// Variabel ini menyimpan model AI untuk embedding (penerjemah teks ke angka)
let extractor: any = null;

export interface RagResult {
    content: string;
    metadata: any;
    distance: number;
}

/**
 * Fungsi Utama RAG (Retrieval Augmented Generation)
 * Tugasnya mencarik data harga yang paling relevan dari database berdasarkan pertanyaan user.
 * 
 * @param query - Pertanyaan dari user (misal: "harga kitchen set")
 * @param limit - Jumlah data yang diambil (default 3)
 * @returns String teks berisi informasi harga yang ditemukan
 */
export async function searchPricing(query: string, limit: number = 3): Promise<string> {
    try {
        // Cek apakah model AI sudah siap, kalau belum disiapkan dulu (Lazy Loading)
        if (!extractor) {
            console.log("Initializing Xenova pipeline...");
            extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }

        // 1. Ubah pertanyaan user menjadi vektor angka (Embedding)
        const extractorFn = extractor;
        const result = await extractorFn(query, { pooling: 'mean', normalize: true });
        const embedding = Array.from(result.data);
        const embeddingString = `[${embedding.join(',')}]`;

        // 2. Cari di Database TiDB menggunakan Vector Search (Cosine Distance)
        const sql = `
      SELECT content, metadata, VEC_COSINE_DISTANCE(embedding, '${embeddingString}') as distance
      FROM pricing_embeddings
      ORDER BY distance ASC
      LIMIT ?
    `;

        const rows = await dbRequest<RagResult[]>(sql, [limit]);

        // Jika tidak ada data yang cocok, kembalikan string kosong
        if (!rows || rows.length === 0) {
            return "";
        }

        // 3. Format hasil pencarian menjadi teks yang mudah dibaca AI
        return rows.map(r => {
            let text = r.content;

            // Tambahkan detail khusus dari metadata (Harga Luar/Dalam Kota)
            if (r.metadata) {
                // Parsing metadata jika bentuknya string JSON
                const meta = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;

                const prices = [];
                // Cek harga dalam kota
                if (meta.price_dalam_kota) prices.push(`- Harga Dalam Kota: Rp ${Number(meta.price_dalam_kota).toLocaleString('id-ID')}`);
                // Cek harga luar kota
                if (meta.price_luar_kota) prices.push(`- Harga Luar Kota: Rp ${Number(meta.price_luar_kota).toLocaleString('id-ID')}`);

                // Cek biaya tambahan lainnya
                if (meta.fee) prices.push(`- Biaya Tambahan: Rp ${Number(meta.fee).toLocaleString('id-ID')} (${meta.condition || ''})`);

                // Gabungkan ke dalam teks
                if (prices.length > 0) {
                    text += `\n\n[DATA SPESIFIK SISTEM]:\n${prices.join('\n')}`;
                }
            }
            return text;
        }).join("\n\n---\n\n");

    } catch (error) {
        // Jika error, catat di console dan kembalikan kosong agar chat tetap jalan (Fallback)
        console.error("Error searching pricing RAG:", error);
        return "";
    }
}

