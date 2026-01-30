
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';
import { pipeline } from '@xenova/transformers';

// === KONFIGURASI ENVIRONMENT ===
// Memuat variabel .env.local secara manual karena script ini dijalankan di terminal (bukan browser/nextjs)
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

// Lokasi folder data RAG
const RAG_DATA_DIR = path.join(process.cwd(), 'rag_data');

// Konfigurasi Database TiDB (Serverless)
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

/**
 * Fungsi Utama Setup RAG
 * Script ini bertugas untuk:
 * 1. Membaca semua file data json/txt di folder rag_data
 * 2. Mengubah teks menjadi vektor angka (Embedding) menggunakan AI
 * 3. Menyimpan data + vektornya ke database TiDB agar bisa dicari oleh Chatbot
 */
async function main() {
    // Cek kelengkapan kredensial database
    if (!TIDB_CONFIG.host || !TIDB_CONFIG.user || !TIDB_CONFIG.password) {
        console.error('❌ Error: TiDB credentials are missing in .env.local');
        process.exit(1);
    }

    console.log('🔄 Loading Local Embedding Model (Xenova)...');
    // Memuat model AI Xenova untuk konversi teks ke vektor
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    console.log('🔌 Connecting to TiDB...');
    const connection = await mysql.createConnection(TIDB_CONFIG);

    try {
        // === PERSIAPAN DATABASE ===
        console.log('📦 Setting up database schema...');
        // Hapus tabel lama agar data selalu fresh (Total Reset)
        await connection.execute('DROP TABLE IF EXISTS pricing_embeddings');

        // Buat tabel baru dengan kolom VECTOR(384)
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS pricing_embeddings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(255),  -- Nama file atau kategori sumber
        item_name VARCHAR(255), -- Nama produk atau judul
        content TEXT,           -- Teks utama yang akan dibaca AI
        metadata JSON,          -- Data tambahan (harga, spek) struktur JSON
        embedding VECTOR(384),  -- Vektor angka hasil embedding
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('🧹 Table truncated.');

        // === MEMBACA DATA MENTAH ===
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

            // A. Handle File Teks (.txt) - Biasanya Rules
            if (file.endsWith('.txt')) {
                const content = fs.readFileSync(filePath, 'utf-8');
                chunks.push({
                    text: content,
                    title: 'System Rules',
                    metadata: { source: file }
                });
            }

            // B. Handle File Data (.json) - Produk & Harga
            else if (file.endsWith('.json')) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                // Strategi Parsing Berdasarkan Isi File:

                // 1. Data Produk (Array List)
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        // Prioritaskan 'rag_context' jika sudah dibuat manual
                        let text = item.rag_context || '';
                        // Jika belum ada, buat teks deskripsi otomatis dari data
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

                // 2. Profil Perusahaan & Aturan (Object)
                else {
                    if (file.includes('company')) {
                        // Profil Perusahaan
                        const profile = data.company_profile || {};
                        const text = `Profil Perusahaan: ${profile.name} (${profile.brand_name}). ${profile.description}.`;
                        chunks.push({ text, title: 'Company Profile', metadata: profile });
                    }
                    else if (file.includes('operational')) {
                        // Aturan Operasional (Ongkir, FAQ)
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
                        // Pekerjaan Sipil (Dictionary Object)
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
                        // Perbandingan Tier Material
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

            // === PENYIMPANAN KE DATABASE ===
            for (const chunk of chunks) {
                if (!chunk.text) continue;

                // 1. Generate Embedding (Teks -> Angka)
                const output = await extractor(chunk.text, { pooling: 'mean', normalize: true });
                const embedding = Array.from(output.data);
                const embeddingString = `[${embedding.join(',')}]`;

                // 2. Insert ke TiDB
                await connection.execute(
                    `INSERT INTO pricing_embeddings (category, item_name, content, metadata, embedding) VALUES (?, ?, ?, ?, ?)`,
                    [fileName, chunk.title, chunk.text, JSON.stringify(chunk.metadata || {}), embeddingString]
                );
                process.stdout.write('.'); // Indikator progres (titik)
                totalCount++;
            }
            console.log(`\n   ✅ Processed ${chunks.length} chunks from ${file}`);
        }

        console.log(`\n🎉 SELESAI: Berhasil menyimpan ${totalCount} potongan data ke database TiDB!`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

main();
