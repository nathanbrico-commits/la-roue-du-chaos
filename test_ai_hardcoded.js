const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyBmYopk1x8UWvF1cCB53GD_jzc2Cu25Iww');
async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hello!');
    console.log('SUCCESS:', result.response.text());
  } catch (e) {
    console.log('ERRORCODE:', e.status || e.code || 'NO_CODE');
    console.log('ERROR_MSG:', e.message);
  }
}
test();
