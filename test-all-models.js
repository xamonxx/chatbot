
const https = require('https');

const API_KEY = "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";
// Model dari daftar Anda
const MODELS = [
    "google/gemma-3-12b-it:free",
    "meta-llama/llama-3.1-405b-instruct:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "google/gemma-3-4b-it:free"
];

function testModel(modelName) {
    return new Promise((resolve) => {
        console.log(`Testing model: ${modelName}...`);
        const start = Date.now();

        // Gunakan format System Prompt yang digabung (Safe Mode)
        const data = JSON.stringify({
            model: modelName,
            messages: [
                { role: "user", content: "[SYSTEM INSTRUCTION]\nYou are helpful.\n\n[USER REQUEST]\nHi" }
            ]
        });

        const options = {
            hostname: 'openrouter.ai',
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Diagnostic Script"
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const duration = Date.now() - start;
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const json = JSON.parse(body);
                        const content = json.choices?.[0]?.message?.content || 'No content';
                        console.log(`✅ SUCCESS (${duration}ms) | Response: ${content.substring(0, 30)}...`);
                        resolve({ success: true, name: modelName, duration });
                    } catch (e) {
                        console.error(`❌ JSON ERROR`);
                        resolve({ success: false, name: modelName });
                    }
                } else {
                    console.error(`❌ FAILED (${res.statusCode}): ${body.substring(0, 50)}...`);
                    resolve({ success: false, name: modelName });
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ NETWORK ERROR`);
            resolve({ success: false, name: modelName });
        });

        req.write(data);
        req.end();
    });
}

async function runDiagnostics() {
    console.log("=== UJI COBA MODEL FREE ===");
    const results = [];
    for (const model of MODELS) {
        const result = await testModel(model);
        results.push(result);
        console.log("--------------------------------");
    }

    // Summary
    const winner = results.filter(r => r.success).sort((a, b) => a.duration - b.duration)[0];
    if (winner) {
        console.log(`🏆 WINNER: ${winner.name} (${winner.duration}ms)`);
        console.log("PLEASE USE THIS MODEL!");
    } else {
        console.log("⚠️ ALL FAILED");
    }
}

runDiagnostics();
