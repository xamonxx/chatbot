
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';
import { pipeline } from '@xenova/transformers';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const RAG_DATA_DIR = path.join(process.cwd(), 'rag_data');

const TIDB_CONFIG = {
    host: process.env.TIDB_HOST,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    port: Number(process.env.TIDB_PORT) || 4000,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
};

async function main() {
    if (!TIDB_CONFIG.host || !TIDB_CONFIG.user || !TIDB_CONFIG.password) {
        console.error('❌ Error: TiDB credentials are missing in .env.local');
        process.exit(1);
    }

    console.log('🔄 Loading Local Embedding Model (Xenova)...');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    console.log('🔌 Connecting to TiDB...');
    const connection = await mysql.createConnection(TIDB_CONFIG);

    try {
        console.log('📦 Setting up database schema...');
        await connection.execute('DROP TABLE IF EXISTS pricing_embeddings');

        // Updated Schema to be more generic for RAG
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS pricing_embeddings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(255),  -- Source filename or category
        item_name VARCHAR(255), -- Optional title
        content TEXT,           -- The main text chunk for RAG
        metadata JSON,          -- Extra structured data if needed
        embedding VECTOR(384),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('🧹 Table truncated.');

        console.log('📂 Reading RAG Data from: ' + RAG_DATA_DIR);
        if (!fs.existsSync(RAG_DATA_DIR)) {
            throw new Error("RAG Data directory not found!");
        }

        const files = fs.readdirSync(RAG_DATA_DIR);
        let totalCount = 0;

        for (const file of files) {
            const filePath = path.join(RAG_DATA_DIR, file);
            const fileName = file.replace('.json', '').replace('.txt', '');

            console.log(`   Processing file: ${file}`);

            let chunks: { text: string; title: string, metadata?: any }[] = [];

            // 1. Handle Text Files
            if (file.endsWith('.txt')) {
                const content = fs.readFileSync(filePath, 'utf-8');
                chunks.push({
                    text: content,
                    title: 'System Rules',
                    metadata: { source: file }
                });
            }

            // 2. Handle JSON Files
            else if (file.endsWith('.json')) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                // Strategy: Different parsing based on file content structure

                // A. Product Lists (Array of items)
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        // Use 'rag_context' if available, otherwise construct it
                        let text = item.rag_context || '';
                        if (!text) {
                            text = `${item.name || item.item || ''}. `;
                            if (item.price) text += `Harga: Rp ${item.price.toLocaleString('id-ID')}/${item.unit}. `;
                            if (item.features) text += `Fitur: ${Array.isArray(item.features) ? item.features.join(', ') : item.features}. `;
                            if (item.description) text += `${item.description}`;
                        }

                        chunks.push({
                            text: text,
                            title: item.name || item.item || item.id || 'Product',
                            metadata: item
                        });
                    });
                }

                // B. Company Profile / Rules (Object)
                else {
                    // Determine type based on filename heuristics or content
                    if (file.includes('company')) {
                        // Company Profile
                        const profile = data.company_profile || {};
                        const text = `Profil Perusahaan: ${profile.name} (${profile.brand_name}). ${profile.description}.`;
                        chunks.push({ text, title: 'Company Profile', metadata: profile });
                    }
                    else if (file.includes('operational')) {
                        // Operational Rules
                        if (data.shipping_policy) {
                            data.shipping_policy.forEach((rule: any) => {
                                chunks.push({
                                    text: `Aturan Ongkir ${rule.region}: ${rule.description}. Biaya: Rp ${rule.fee.toLocaleString('id-ID')}. Syarat: ${rule.condition}.`,
                                    title: 'Shipping Rule',
                                    metadata: rule
                                });
                            });
                        }
                        if (data.faq_rules) {
                            data.faq_rules.forEach((faq: any) => {
                                chunks.push({
                                    text: `Q: ${faq.question} A: ${faq.answer}`,
                                    title: 'FAQ',
                                    metadata: faq
                                });
                            });
                        }
                    }
                    else if (file.includes('civil')) {
                        // Civil works (nested object sometimes) - flatten it
                        // Based on our file: { pengecatan: [...], instalasi: [...] }
                        for (const key in data) {
                            if (Array.isArray(data[key])) {
                                data[key].forEach((item: any) => {
                                    chunks.push({
                                        text: `Pekerjaan Sipil (${key}): ${item.item}. Harga: Rp ${item.price.toLocaleString('id-ID')}/${item.unit}.`,
                                        title: item.item,
                                        metadata: item
                                    });
                                });
                            }
                        }
                    }
                    else if (file.includes('price_tiers')) {
                        if (data.comparison_matrix && data.comparison_matrix.kitchen_set) {
                            data.comparison_matrix.kitchen_set.forEach((tier: any) => {
                                chunks.push({
                                    text: `Perbandingan Material Kitchen Set (${tier.material}): Grade ${tier.tier}. Harga ${tier.price_range}. Kelebihan: ${tier.pros}. Kekurangan: ${tier.cons}. Durabilitas: ${tier.durability}.`,
                                    title: `Tier ${tier.material}`,
                                    metadata: tier
                                });
                            });
                        }
                    }
                }
            }

            // Insert Chunks into TiDB
            for (const chunk of chunks) {
                if (!chunk.text) continue;

                // Generate Embedding
                const output = await extractor(chunk.text, { pooling: 'mean', normalize: true });
                const embedding = Array.from(output.data);
                const embeddingString = `[${embedding.join(',')}]`;

                // Insert
                await connection.execute(
                    `INSERT INTO pricing_embeddings (category, item_name, content, metadata, embedding) VALUES (?, ?, ?, ?, ?)`,
                    [fileName, chunk.title, chunk.text, JSON.stringify(chunk.metadata || {}), embeddingString]
                );
                process.stdout.write('.'); // Progress dot
                totalCount++;
            }
            console.log(`\n   ✅ Processed ${chunks.length} chunks from ${file}`);
        }

        console.log(`\n🎉 TOTAL FINISHED: Successfully embedded ${totalCount} context chunks into TiDB!`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

main();
