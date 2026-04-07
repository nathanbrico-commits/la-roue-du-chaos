const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "https://www.gstatic.com", "https://*.googleapis.com", "https://apis.google.com", "https://*.firebaseapp.com", "https://*.firebasedatabase.app"],
            "script-src-elem": ["'self'", "'unsafe-inline'", "https://www.gstatic.com", "https://*.googleapis.com", "https://apis.google.com", "https://*.firebaseapp.com", "https://*.firebasedatabase.app"],
            "script-src-attr": ["'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://www.gstatic.com"],
            "connect-src": ["'self'", "https://*.firebaseio.com", "wss://*.firebaseio.com", "https://*.firebasedatabase.app", "wss://*.firebasedatabase.app", "https://*.googleapis.com", "https://www.gstatic.com", "https://*.firebaseapp.com"],
            "img-src": ["'self'", "data:", "https://*.googleusercontent.com", "https://*.gstatic.com"],
            "worker-src": ["'self'", "blob:"],
            "upgrade-insecure-requests": null,
        },
    },
})); // Full Firebase/Google compatibility






app.use(cors());
app.disable('x-powered-by'); // hide express
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rate Limiting: Protect AI quotas from abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop de requêtes, réessaie plus tard." }
});


const POOL_FILE = path.join(__dirname, 'pool.json');

// Load saved pool from disk, or initialize from fallbacks
const loadPool = () => {
    try {
        if (fs.existsSync(POOL_FILE)) {
            const data = JSON.parse(fs.readFileSync(POOL_FILE, 'utf8'));
            console.log('[PERSISTENCE] Pool loaded from pool.json');
            return data;
        }
    } catch (e) {
        console.error('[PERSISTENCE] Error reading pool.json, using fallbacks:', e.message);
    }
    return null;
};

const savePool = () => {
    try {
        fs.writeFileSync(POOL_FILE, JSON.stringify({ pool: IDEA_POOL, history: IDEA_HISTORY }, null, 2));
    } catch (e) {
        console.error('[PERSISTENCE] Error saving pool.json:', e.message);
    }
};

const FALLBACK_IDEAS = {
    irl: {
        chill: {
            dare: [
                "Fais une grimace drôle.", "Danse sans musique pendant 10 secondes.", "Chante un refrain de Disney.", 
                "Fais semblant d'être un robot.", "Touche ton nez avec ta langue.", "Fais le tour de la pièce en sautillant.",
                "Imite un animal au hasard.", "Raconte une anecdote de 10 secondes sur ton petit-déjeuner."
            ],
            truth: [
                "Quelle est ta couleur préférée ?", "Ton plat préféré ?", "Raconte ton dernier rêve bizarre.", 
                "Quel est ton animal de compagnie idéal ?", "Ta chanson préférée du moment ?", "Ton plus lointain souvenir ?",
                "Plutôt lever tôt ou coucher tard ?", "Ta plus grande phobie ?"
            ]
        },
        medium: {
            dare: [
                "Mime un animal (les autres doivent deviner).", "Fais 10 pompes.", "Raconte une blague très nulle.", 
                "Imite une célébrité connue.", "Fais un compliment sincère à chaque joueur.", "Parle avec un accent bizarre pendant 2 tours.",
                "Tiens en équilibre sur une jambe pendant 1 minute.", "Fais une battle de regard avec la personne à ta gauche."
            ],
            truth: [
                "Ton plus grand secret de cette année ?", "Ta plus grosse peur ?", "Qui était ton premier amour ?", 
                "Chose la plus ridicule faite par amour ?", "Quel joueur ici connais-tu le mieux ?", "Quelle est ta pire habitude ?",
                "Si tu gagnais au loto demain, que ferais-tu ?", "Ton plus grand regret ?"
            ]
        },
        hard: {
            dare: [
                "Défi piquant (mange un truc fort).", "Appelle un ami et raccroche sans parler.", "Raconte une anecdote embarrassante.", 
                "Laisse les autres envoyer un emoji à ton dernier contact.", "Échange un vêtement avec la personne à ta droite.",
                "Fais une chorégraphie sur une chanson choisie par les autres.", "Laisse quelqu'un te maquiller les yeux fermés.",
                "Sors dehors et cris 'Le Chaos arrive !'."
            ],
            truth: [
                "Plus gros mensonge aux parents ?", "Plus grand regret ?", "Chose la plus osée faite ?", 
                "Coup de foudre pour quelqu'un ici ?", "As-tu déjà triché à un jeu ?", "Quel est ton plus gros complexe ?",
                "Raconte ton moment le plus gênant en public.", "Quelle est la personne que tu aimes le moins ici ?"
            ]
        }
    },
    online: {
        chill: {
            dare: [
                "Change ton pseudo pour 'Mister Chaos'.", "Envoie un message en majuscules dans le chat.", 
                "Mets un filtre drôle sur ta caméra.", "Fais une grimace à la caméra.", "Montre ton animal (ou une peluche).",
                "Envoie le 5ème emoji de ta liste 'Fréquents'.", "Mets un fond d'écran de plage.", "Bois un verre d'eau cul-sec."
            ],
            truth: [
                "Ta série préférée du moment ?", "Ton emoji le plus utilisé ?", "Raconte ton dernier rêve bizarre.", 
                "Quel est ton animal de compagnie idéal ?", "Quel est ton fond d'écran actuel ?", "Ta chanson honteuse préférée ?",
                "Le dernier truc que tu as acheté en ligne ?", "Es-tu en pyjama actuellement ?"
            ]
        },
        medium: {
            dare: [
                "Montre l'objet le plus bizarre à portée de main.", "Envoie le 10ème émoji de ta liste au groupe.", 
                "Fais une capture d'écran de ta pire grimace et montre-la.", "Change ton fond d'écran pour une photo de canard.",
                "Mime une célébrité (les autres devinent en chat).", "Fais 15 sautillements face caméra.",
                "Écris 'Je suis un génie' sur ton front (feutre effaçable!).", "Imite un autre joueur via le chat."
            ],
            truth: [
                "Ton plus grand secret de cette année ?", "Ta plus grosse peur ?", "Le dernier message reçu sur ton téléphone ?", 
                "Chose la plus ridicule faite par amour ?", "Quel est ton historique de recherche Google (les 2 derniers) ?",
                "Quelle est la personne que tu stalkes le plus ?", "Quelle appli utilises-tu trop ?", "Ton pire souvenir d'école ?"
            ]
        },
        hard: {
            dare: [
                "Montre ton historique YouTube (3 derniers).", "Envoie 'Je t'aime' à ton 3ème contact WhatsApp.", 
                "Laisse le groupe choisir ta prochaine photo de profil.", "Raconte une anecdote embarrassante.",
                "Partage ton écran et montre tes photos (3 dernières).", "Envoie un message vocal bizarre à un contact.",
                "Mets un chapeau ou un accessoire ridicule pour le reste du jeu.", "Fais une déclaration d'amour à ton clavier."
            ],
            truth: [
                "Plus gros mensonge aux parents ?", "Plus grand regret ?", "Chose la plus osée faite ?", 
                "Coup de foudre pour quelqu'un ici ?", "Raconte ta plus grosse honte en ligne.", "Quelle est ta pire photo de profil ?",
                "As-tu déjà créé un faux compte ?", "Quel est le dernier truc bizarre que tu as googlé ?"
            ]
        }
    }
};

const callGemini = async (model, key, prompt) => {
    const genConfig = {
        maxOutputTokens: 40,
        temperature: 0.9,
        topP: 0.9,
        topK: 40
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: genConfig
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text.trim();
        }
        
        const errorMsg = data.error ? `${data.error.status}: ${data.error.message}` : (data.message || 'Unknown Gemini Error');
        throw new Error(errorMsg);

    } catch (e) {
        clearTimeout(timeoutId);
        if (e.name === 'AbortError') {
            throw new Error('AI Timeout');
        }
        throw e;
    }
};

// Initialize pool and history from disk or fallbacks
const savedData = loadPool();
const IDEA_POOL = savedData?.pool || JSON.parse(JSON.stringify(FALLBACK_IDEAS));

const IDEA_HISTORY = savedData?.history || {
    irl: { chill: { dare: [], truth: [] }, medium: { dare: [], truth: [] }, hard: { dare: [], truth: [] } },
    online: { chill: { dare: [], truth: [] }, medium: { dare: [], truth: [] }, hard: { dare: [], truth: [] } }
};
const MAX_HISTORY = 15;

const refillPool = async (playMode, mode, type, key) => {
    let typeText = type === 'dare' ? 'un gage' : 'une vérité';
    let playModeText = playMode === 'online' ? 'joué à distance/en ligne (pas de contact physique)' : 'joué en personne/IRL';
    
    // Include recent history in prompt to force variety
    const history = IDEA_HISTORY[playMode][mode][type];
    let historyText = '';
    if (history.length > 0) {
        historyText = `\nIDÉES DÉJÀ UTILISÉES (NE PAS RÉPÉTER): ${history.slice(-10).join(' / ')}`;
    }
    
    const prompt = `Tu génères des défis pour un jeu entre amis appelé "La Roue du Chaos".
Catégorie: ${typeText}. Difficulté: ${mode}. Contexte: ${playModeText}.
RÈGLES STRICTES:
- Écris UN SEUL défi concret et amusant (10 mots MAX).
- Le défi doit être une ACTION ou une QUESTION que le joueur doit faire.
- NE GÉNÈRE PAS de slogan, de description du jeu, ou de phrase motivationnelle.
- Sois ORIGINAL et CRÉATIF. Ne répète jamais une idée déjà donnée.${historyText}
Réponds UNIQUEMENT avec le texte du défi, rien d'autre.`;

    const modelsToTry = [
        'gemini-3.1-flash-lite-preview',  // 500 RPD, 15 RPM
        'gemma-3-4b-it'                    // 14,400 RPD, 30 RPM (rapide + quasi-illimité)
    ];

    for (const modelName of modelsToTry) {
        try {
            const text = await callGemini(modelName, key, prompt);
            if (text) {
                // Check for duplicates before adding
                const pool = IDEA_POOL[playMode][mode][type];
                const isDuplicate = pool.some(existing => existing.toLowerCase() === text.toLowerCase()) ||
                                    history.some(h => h.toLowerCase() === text.toLowerCase());
                if (!isDuplicate) {
                    pool.push(text);
                    console.log(`[AI SUCCESS] Pool replenished for ${playMode}-${mode}-${type} using ${modelName}. Current size: ${pool.length}`);
                    savePool();
                } else {
                    console.log(`[AI DUPLICATE] Skipped duplicate for ${playMode}-${mode}-${type}: "${text}"`);
                    // Try again with next model
                    continue;
                }
                return;
            }
        } catch (e) {
            console.warn(`[AI REFILL ERROR] ${modelName} failed for ${playMode}-${mode}-${type}: ${e.message}`);
            if (e.message.includes('429') || e.message.includes('RESOURCE_EXHAUSTED')) {
                break;
            }
        }
    }
    
    // If all AI fails, add a random fallback that's NOT already in pool or recent history
    console.error(`[POOL REFILL FAILED] All AI models failed for ${playMode}-${mode}-${type}. Adding fallback.`);
    const fbList = FALLBACK_IDEAS[playMode][mode][type];
    const pool = IDEA_POOL[playMode][mode][type];
    const available = fbList.filter(fb => !pool.includes(fb) && !history.includes(fb));
    if (available.length > 0) {
        pool.push(available[Math.floor(Math.random() * available.length)]);
    } else {
        pool.push(fbList[Math.floor(Math.random() * fbList.length)]);
    }
    savePool();
};

app.get('/api/generate', limiter, async (req, res) => {
    const type = req.query.type || 'dare';
    const mode = req.query.mode || 'medium';
    const playMode = req.query.playMode || 'irl';
    const key = (process.env.GEMINI_API_KEY || '').trim();

    // STRICT INPUT VALIDATION
    const validTypes = ['dare', 'truth'];
    const validModes = ['chill', 'medium', 'hard'];
    const validPlayModes = ['irl', 'online'];

    if (!validTypes.includes(type) || !validModes.includes(mode) || !validPlayModes.includes(playMode)) {
        return res.status(400).json({ error: "Paramètres invalides" });
    }

    if (!key) {
        return res.status(500).json({ error: "Clé API manquante" });
    }

    // 1. SIMULATE THINKING (User requested ~2s)
    await new Promise(resolve => setTimeout(resolve, 800));

    // 2. GET IDEA FROM POOL (FIFO)
    const pool = IDEA_POOL[playMode][mode][type];
    let text;
    let source = 'pool';

    if (pool.length > 0) {
        text = pool.shift();
    } else {
        const fbList = FALLBACK_IDEAS[playMode][mode][type];
        text = fbList[Math.floor(Math.random() * fbList.length)];
        source = 'emergency_fallback';
    }

    // 3. RECORD IN HISTORY (for anti-repeat prompt)
    const history = IDEA_HISTORY[playMode][mode][type];
    history.push(text);
    if (history.length > MAX_HISTORY) history.shift();
    savePool();

    // 4. RETURN TO USER
    res.json({ text, source });

    // 5. REFILL IN BACKGROUND
    process.nextTick(() => refillPool(playMode, mode, type, key));
});


app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
