require('dotenv').config();
const key = process.env.GEMINI_API_KEY.trim();
async function run() {
    try {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key);
        const data = await r.json();
        if (data.models) {
            data.models.forEach(m => {
                console.log('Model:', m.name);
                console.log('Methods:', m.supportedGenerationMethods.join(', '));
                console.log('---');
            });
        } else {
            console.log('Error:', JSON.stringify(data, null, 2));
        }
    } catch (e) { console.log('Fetch error:', e.message); }
}
run();
