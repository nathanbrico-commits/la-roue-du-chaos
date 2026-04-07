# La Roue du Chaos 🎡

Une application utilisant l'IA de Google (Gemini) pour gérer des scénarios de jeu dynamiques.

## 🚀 Installation

1.  **Installation des dépendances**
    ```bash
    npm install
    ```

2.  **Configuration des variables d'environnement**
    Le fichier `.env` n'est pas pushé pour des raisons de sécurité. Tu dois le recréer localement :
    ```bash
    cp .env.example .env # Si j'en crée un, sinon :
    echo "GEMINI_API_KEY=TES_CLE_API" > .env
    ```

## 🏗️ Lancement

Pour lancer le serveur Node.js :
```bash
node server.js
```
L'application devrait être accessible sur le port défini dans le code (souvent 8080 ou 3000).

---
*Note : Assure-toi d'avoir Node.js installé sur ta machine.*
