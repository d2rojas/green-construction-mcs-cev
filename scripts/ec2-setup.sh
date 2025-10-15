#!/bin/bash

# MCS-CEV Optimization System - EC2 Setup Script
# ==============================================

echo "🚀 Configurando servidor EC2 para MCS-CEV Optimization System..."
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Update system packages
print_status $BLUE "📦 Actualizando paquetes del sistema..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status $BLUE "🔧 Instalando paquetes esenciales..."
sudo apt install -y curl wget git build-essential software-properties-common

# Install Node.js 18.x
print_status $BLUE "📦 Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
print_status $GREEN "✅ Node.js instalado: $(node --version)"
print_status $GREEN "✅ npm instalado: $(npm --version)"

# Install Julia
print_status $BLUE "📦 Instalando Julia..."
wget https://julialang-s3.julialang.org/bin/linux/x64/1.9/julia-1.9.4-linux-x86_64.tar.gz
tar -xzf julia-1.9.4-linux-x86_64.tar.gz
sudo mv julia-1.9.4 /opt/julia
sudo ln -s /opt/julia/bin/julia /usr/local/bin/julia
rm julia-1.9.4-linux-x86_64.tar.gz

# Verify Julia installation
print_status $GREEN "✅ Julia instalado: $(julia --version)"

# Install Julia packages
print_status $BLUE "📦 Instalando paquetes de Julia..."
julia -e 'using Pkg; Pkg.add(["JuMP", "HiGHS", "Plots", "DataFrames", "CSV", "Printf", "Dates"])'

# Install PM2 for process management
print_status $BLUE "📦 Instalando PM2..."
sudo npm install -g pm2

# Install Nginx
print_status $BLUE "📦 Instalando Nginx..."
sudo apt install -y nginx

# Configure firewall
print_status $BLUE "🔥 Configurando firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001
sudo ufw allow 3002
sudo ufw --force enable

# Create application directory
print_status $BLUE "📁 Creando directorio de aplicación..."
sudo mkdir -p /var/www/mcs-cev-optimization
sudo chown -R $USER:$USER /var/www/mcs-cev-optimization

# Clone repository
print_status $BLUE "📥 Clonando repositorio..."
cd /var/www/mcs-cev-optimization
git clone https://github.com/d2rojas/green-construction-mcs-cev.git .

# Install application dependencies
print_status $BLUE "📦 Instalando dependencias de la aplicación..."
cd optimization-interface
npm install
cd backend
npm install
cd ../..

# Create environment file
print_status $BLUE "⚙️ Configurando variables de entorno..."
cat > optimization-interface/backend/.env << EOF
NODE_ENV=production
PORT=3002
OPENAI_API_KEY=your-openai-api-key-here
EOF

# Create PM2 ecosystem file
print_status $BLUE "⚙️ Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'mcs-cev-backend',
      script: 'optimization-interface/backend/server.js',
      cwd: '/var/www/mcs-cev-optimization',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'mcs-cev-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/mcs-cev-optimization/optimization-interface',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF

# Configure Nginx
print_status $BLUE "⚙️ Configurando Nginx..."
sudo tee /etc/nginx/sites-available/mcs-cev-optimization << EOF
server {
    listen 80;
    server_name _;

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

# Enable Nginx site
sudo ln -s /etc/nginx/sites-available/mcs-cev-optimization /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Start applications with PM2
print_status $BLUE "🚀 Iniciando aplicaciones con PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Create systemd service for PM2
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

print_status $GREEN "🎉 ¡Configuración completada!"
echo ""
print_status $BLUE "📊 Información del servidor:"
print_status $BLUE "   - Frontend: http://$(curl -s ifconfig.me):3001"
print_status $BLUE "   - Backend: http://$(curl -s ifconfig.me):3002"
print_status $BLUE "   - Nginx: http://$(curl -s ifconfig.me)"
echo ""
print_status $YELLOW "💡 Próximos pasos:"
print_status $YELLOW "   1. Configura tu clave API de OpenAI en optimization-interface/backend/.env"
print_status $YELLOW "   2. Reinicia los servicios: pm2 restart all"
print_status $YELLOW "   3. Verifica el estado: pm2 status"
print_status $YELLOW "   4. Revisa los logs: pm2 logs"
echo ""
print_status $GREEN "✅ ¡Tu aplicación MCS-CEV está lista en la nube!"
