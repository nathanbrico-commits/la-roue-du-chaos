const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function list() {
  try {
    const list = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).listModels();
    console.log(JSON.stringify(list, null, 2));
  } catch (e) {
    // The SDK sometimes doesn't have a direct listModels on the genAI object for some versions
    console.log('Error listing:', e.message);
  }
}
async function listManual() {
  const fetch = require('node-fetch');
  const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('Fetch error:', e.message);
  }
}
// Try with a newer model name first as a quick test
async function testLatest() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const result = await model.generateContent('test');
        console.log('SUCCESS LATEST');
    } catch (e) {
        console.log('FAILED LATEST:', e.message);
    }
}
testLatest().then(() => listManual());
