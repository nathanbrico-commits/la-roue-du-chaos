const fetch = require('node-fetch');
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;
const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + key;

console.log('Testing key:', key.substring(0, 10) + '...');

async function test() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Say hello' }] }] })
        });
        const data = await response.json();
        console.log('STATUS:', response.status);
        console.log('RESPONSE:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.log('FETCH_ERROR:', e.message);
    }
}
test();
