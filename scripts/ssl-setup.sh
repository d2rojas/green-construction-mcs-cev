#!/bin/bash

# SSL Setup Script for MCS-CEV Optimization System
# ================================================

echo "🔒 Configurando SSL con Let's Encrypt..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if domain is provided
if [ -z "$1" ]; then
    print_status $RED "❌ Error: Debes proporcionar un dominio"
    print_status $YELLOW "Uso: ./ssl-setup.sh tu-dominio.com"
    exit 1
fi

DOMAIN=$1

# Install Certbot
print_status $BLUE "📦 Instalando Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Update Nginx configuration with domain
print_status $BLUE "⚙️ Actualizando configuración de Nginx..."
sudo tee /etc/nginx/sites-available/mcs-cev-optimization << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend (React)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Test Nginx configuration
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
print_status $BLUE "🔒 Obteniendo certificado SSL..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Setup auto-renewal
print_status $BLUE "🔄 Configurando renovación automática..."
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

print_status $GREEN "🎉 ¡SSL configurado exitosamente!"
print_status $BLUE "🌐 Tu aplicación está disponible en: https://$DOMAIN"
