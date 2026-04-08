#!/bin/bash

# Configuration
DOMAIN="chaos.piranha.bricoweb.be"
WEB_ROOT="/var/www/chaos"
NGINX_CONF="/etc/nginx/sites-available/chaos"
REPO_URL="https://github.com/nathanbrico-commits/la-roue-du-chaos.git"

echo "🚀 Déploiement de La Roue du Chaos sur Ubuntu 24.04..."

# 1. Installation des prérequis
sudo apt update
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# 2. Installation de Node.js 20 et PM2
if ! command -v node > /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
sudo npm install -g pm2

# 3. Récupération du code
sudo mkdir -p $WEB_ROOT
sudo chown -R $USER:$USER $WEB_ROOT

if [ -d "$WEB_ROOT/.git" ]; then
    echo "🔄 Mise à jour du code existant..."
    cd $WEB_ROOT
    git pull
else
    echo "📥 Clonage du projet..."
    git clone $REPO_URL $WEB_ROOT
    cd $WEB_ROOT
fi

# 4. Installation des dépendances Node.js
npm install

# 5. Démarrage du backend avec PM2
pm2 stop chaos-backend 2>/dev/null || true
pm2 start server.js --name "chaos-backend"
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# 6. Configuration Nginx (Reverse Proxy + Static)
sudo bash -c "cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    root $WEB_ROOT;
    index index.html;

    # Routes React/Frontend statique
    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }

    # Redirection vers le backend Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF"

# 7. Activation du site
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Déploiement terminé pour http://$DOMAIN"
echo "👉 Il ne reste plus qu'à créer le fichier d'environnement :"
echo "nano $WEB_ROOT/.env"
echo "Puis ajoutez : GEMINI_API_KEY=votre_cle_ici"
echo "Ensuite relancez le backend : pm2 restart chaos-backend"
echo "💡 SSL (HTTPS) : sudo certbot --nginx -d $DOMAIN"
