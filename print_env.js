require('dotenv').config();
const k = process.env.GEMINI_API_KEY;
console.log('KEY: [' + k + ']');
console.log('LENGTH:', k ? k.length : 'NULL');
if (k) {
  for (let i=0; i<k.length; i++) {
    console.log(i, k.charCodeAt(i), k[i]);
  }
}
