require('dotenv').config();
const key = process.env.GEMINI_API_KEY.trim();
const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + key;

async function test() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log('MODELS:', data.models.map(m => m.name).join(', '));
        } else {
            console.log('ERROR:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log('FETCH_ERROR:', e.message);
    }
}
test();
