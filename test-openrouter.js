
const https = require('https');

const API_KEY = "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";
const MODELS = [
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-chat:free"
];

function testModel(modelName) {
    return new Promise((resolve) => {
        console.log(`Testing model: ${modelName}...`);
        const start = Date.now();

        const data = JSON.stringify({
            model: modelName,
            messages: [{ role: "user", content: "Hi" }]
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
                        console.log(`✅ SUCCESS (${duration}ms)`);
                        console.log(`Response: ${content.substring(0, 50)}...`);
                        resolve(true);
                    } catch (e) {
                        console.error(`❌ JSON ERROR: ${e.message}`);
                        resolve(false);
                    }
                } else {
                    console.error(`❌ FAILED (${res.statusCode}): ${body.substring(0, 200)}`);
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ NETWORK ERROR: ${e.message}`);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
}

async function runDiagnostics() {
    console.log("=== OPENROUTER DIAGNOSTICS (Native HTTPS) ===");
    for (const model of MODELS) {
        await testModel(model);
        console.log("--------------------------------");
    }
}

runDiagnostics();
