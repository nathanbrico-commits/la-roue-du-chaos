require('dotenv').config();
const key = process.env.GEMINI_API_KEY.trim();
const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + key;

async function test() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Say hi' }] }] })
        });
        const data = await response.json();
        console.log('STATUS:', response.status);
        if (data.candidates) {
            console.log('SUCCESS:', data.candidates[0].content.parts[0].text);
        } else {
            console.log('ERROR:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log('FETCH_ERROR:', e.message);
    }
}
test();
