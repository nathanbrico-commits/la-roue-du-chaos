const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hello!');
    console.log('SUCCESS:', result.response.text());
  } catch (e) {
    console.log('ERROR_OBJ:', JSON.stringify(e, null, 2));
    console.log('ERROR_MSG:', e.message);
  }
}
test();
