

import { dbRequest } from "./tidb";
import { pipeline } from '@xenova/transformers';

// Lazy load extractor agar server tidak crash saat startup
// Variabel ini menyimpan model AI untuk embedding (penerjemah teks ke angka)
let extractor: any = null;
let extractorPromise: Promise<any> | null = null;

// Simple in-memory cache for embeddings (LRU-style with max size)
const embeddingCache = new Map<string, number[]>();
const CACHE_MAX_SIZE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

export interface RagResult {
    content: string;
    metadata: any;
    distance: number;
}

/**
 * Get or initialize the extractor (singleton pattern)
 */
async function getExtractor(): Promise<any> {
    if (extractor) return extractor;

    if (!extractorPromise) {
        console.log("Initializing Xenova pipeline...");
        extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    extractor = await extractorPromise;
    return extractor;
}

/**
 * Get cached embedding or compute new one
 */
async function getEmbedding(query: string): Promise<number[]> {
    const normalizedQuery = query.toLowerCase().trim();
    const now = Date.now();

    // Check cache validity
    if (embeddingCache.has(normalizedQuery)) {
        const timestamp = cacheTimestamps.get(normalizedQuery) || 0;
        if (now - timestamp < CACHE_TTL_MS) {
            return embeddingCache.get(normalizedQuery)!;
        }
        // Expired, remove from cache
        embeddingCache.delete(normalizedQuery);
        cacheTimestamps.delete(normalizedQuery);
    }

    // Compute new embedding
    const extractorFn = await getExtractor();
    const result = await extractorFn(normalizedQuery, { pooling: 'mean', normalize: true });
    const embedding = Array.from(result.data) as number[];

    // Add to cache (evict oldest if full)
    if (embeddingCache.size >= CACHE_MAX_SIZE) {
        const firstKey = embeddingCache.keys().next().value;
        if (firstKey) {
            embeddingCache.delete(firstKey);
            cacheTimestamps.delete(firstKey);
        }
    }

    embeddingCache.set(normalizedQuery, embedding);
    cacheTimestamps.set(normalizedQuery, now);

    return embedding;
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
        // Set timeout for the entire operation (1.5 seconds)
        const timeoutPromise = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('RAG timeout')), 1500)
        );

        const searchPromise = (async () => {
            // 1. Get embedding (cached or new)
            const embedding = await getEmbedding(query);
            const embeddingString = `[${embedding.join(',')}]`;

            // 2. Cari di Database TiDB menggunakan Vector Search (Cosine Distance)
            const sql = `
                SELECT content, metadata, VEC_COSINE_DISTANCE(embedding, '${embeddingString}') as distance
                FROM pricing_embeddings
                ORDER BY distance ASC
                LIMIT ${limit}
            `;

            const rows = await dbRequest<RagResult[]>(sql);

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
        })();

        // Race between timeout and actual search
        return await Promise.race([searchPromise, timeoutPromise]);

    } catch (error: any) {
        // Jika error atau timeout, catat di console dan kembalikan kosong agar chat tetap jalan (Fallback)
        if (error.message !== 'RAG timeout') {
            console.error("Error searching pricing RAG:", error);
        }
        return "";
    }
}

