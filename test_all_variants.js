require('dotenv').config();
const key = process.env.GEMINI_API_KEY;

async function test(version, model) {
    const url = 'https://generativelanguage.googleapis.com/' + version + '/models/' + model + ':generateContent?key=' + key;
    console.log('Testing: ' + version + ' / ' + model);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Say hi' }] }] })
        });
        const data = await response.json();
        if (response.ok) {
            console.log('  -> SUCCESS');
            return true;
        } else {
            console.log('  -> FAIL (' + response.status + '): ' + (data.error ? data.error.message : JSON.stringify(data)));
            return false;
        }
    } catch (e) {
        console.log('  -> FETCH ERROR: ' + e.message);
        return false;
    }
}

async function run() {
    const versions = ['v1', 'v1beta'];
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.5-pro'];
    for (const v of versions) {
        for (const m of models) {
            await test(v, m);
        }
    }
}
run();
