
import { dbRequest } from "./tidb";
import { pipeline } from '@xenova/transformers';

// Lazy load extractor to prevent startup crashes
let extractor: any = null;

export interface RagResult {
    content: string;
    metadata: any;
    distance: number;
}

export async function searchPricing(query: string, limit: number = 3): Promise<string> {
    try {
        if (!extractor) {
            // Initialize pipeline only when needed
            console.log("Initializing Xenova pipeline...");
            extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }

        const extractorFn = extractor;
        const result = await extractorFn(query, { pooling: 'mean', normalize: true });
        const embedding = Array.from(result.data);
        const embeddingString = `[${embedding.join(',')}]`;

        const sql = `
      SELECT content, metadata, VEC_COSINE_DISTANCE(embedding, '${embeddingString}') as distance
      FROM pricing_embeddings
      ORDER BY distance ASC
      LIMIT ?
    `;

        const rows = await dbRequest<RagResult[]>(sql, [limit]);

        if (!rows || rows.length === 0) {
            return "";
        }

        return rows.map(r => {
            let text = r.content;

            // Append explicit price details from metadata if available
            // Note: RAG sometimes misses details in 'content', ensuring metadata is visible fixes "Price Hallucinations"
            if (r.metadata) {
                // TiDB/MySQL2 might return it as object OR string depending on driver settings
                const meta = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;

                // Format prices specifically
                const prices = [];
                if (meta.price_dalam_kota) prices.push(`- Harga Dalam Kota: Rp ${Number(meta.price_dalam_kota).toLocaleString('id-ID')}`);
                if (meta.price_luar_kota) prices.push(`- Harga Luar Kota: Rp ${Number(meta.price_luar_kota).toLocaleString('id-ID')}`);

                // Append fees/rules if they exist
                if (meta.fee) prices.push(`- Biaya Tambahan: Rp ${Number(meta.fee).toLocaleString('id-ID')} (${meta.condition || ''})`);

                if (prices.length > 0) {
                    text += `\n\n[DATA SPESIFIK SISTEM]:\n${prices.join('\n')}`;
                }
            }
            return text;
        }).join("\n\n---\n\n");

    } catch (error) {
        console.error("Error searching pricing RAG:", error);
        // Fallback: Return empty string instead of crashing, allowing Chat logic to proceed with general knowledge
        return "";
    }
}
