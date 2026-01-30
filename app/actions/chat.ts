'use server';

import { searchPricing } from '../lib/rag';
import { pricingData, pricingMeta, importantNotes, deliveryFees, categories } from '../lib/pricing-data';
import fs from 'fs';
import path from 'path';

// Fallback if RAG fails or for initial context
const generateBaseContext = () => {
    let context = `\n=== DATA HARGA LENGKAP HOME PUTRA INTERIOR ===\n`;
    context += `Region: ${pricingMeta.region} | Update: ${pricingMeta.period}\n\n`;

    // Add only critical summary to save tokens if RAG is used, 
    // but here we might still want some base knowledge.
    // Let's rely mainly on RAG for specific items.

    context += `=== INFORMASI UMUM ===\n`;
    context += `1. Gratis Survey & Desain 3D.\n`;
    context += `2. Garansi 12 Bulan.\n`;

    return context;
};

export async function chatWithAI(userMessage: string, history: { role: string, text: string }[] = []) {
    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!apiKey) {
        return { error: 'API Key Not Found' };
    }

    try {
        // 1. RAG Retrieval
        // Cari data relevan dari TiDB berdasarkan pertanyaan user
        const ragContext = await searchPricing(userMessage, 5);

        // 2. Load System Prompt from File
        // This ensures the AI follows the centralized behavior rules
        const rulesPath = path.join(process.cwd(), 'rag_data', 'ai_behavior_rules.txt');
        let baseRules = "";
        try {
            baseRules = fs.readFileSync(rulesPath, 'utf-8');
        } catch (e) {
            console.error("Could not load rule file", e);
            baseRules = "PERAN: Kamu adalah Sales Interior profesional. Jawab sopan dan berdasarkan data.";
        }

        const systemPrompt = `
${baseRules}

KONTEKS DATABASE (PENTING: Gunakan informasi ini sebagai acuan utama):
${ragContext ? ragContext : 'Tidak ada data spesifik dari database, gunakan pengetahuan umum interior standard.'}

REFERENSI TAMBAHAN (Jika tidak ada di RAG):
- Garansi 12 Bulan
- Gratis Survey & Desain 3D (Area Bandung)
`;

        // 3. Call Groq API
        // Maintain simple history (last 5 messages) to save tokens
        const recentHistory = history.slice(-5).map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.text
        }));

        const messages = [
            { role: 'system', content: systemPrompt },
            ...recentHistory,
            { role: 'user', content: userMessage }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile', // Use the smart model
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return { result: data.choices[0]?.message?.content || 'Maaf, saya tidak mengerti.' };

    } catch (error: any) {
        console.error('AI Chat Error:', error);
        return { error: 'Terjadi kesalahan pada sistem AI. Silakan coba lagi nanti.' };
    }
}
