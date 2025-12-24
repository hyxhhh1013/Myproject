#!/bin/bash

# Exit on error
set -e

echo "开始服务器环境初始化..."

# 1. Update system
sudo apt-get update
sudo apt-get install -y curl git nginx psmisc unzip

# 2. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Setup Project Directory
sudo mkdir -p /var/www/personal-website
sudo chown -R $USER:$USER /var/www/personal-website

# 5. Move files (Assuming files are in ~/deployment)
echo "正在部署文件..."

# Clean up old frontend (safe to remove all)
if [ -d "/var/www/personal-website/frontend" ]; then
    echo "清理旧的前端文件..."
    sudo rm -rf /var/www/personal-website/frontend/*
fi

# Clean up old backend code (dist) but keep uploads and db
if [ -d "/var/www/personal-website/backend/dist" ]; then
    echo "清理旧的后端代码..."
    sudo rm -rf /var/www/personal-website/backend/dist
fi

cp -r ~/deployment/frontend /var/www/personal-website/
cp -r ~/deployment/backend /var/www/personal-website/

# 6. Setup Backend
echo "正在配置后端..."
cd /var/www/personal-website/backend

# Create .env file
cat > .env << EOL
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-key-change-this"
NODE_ENV="production"
EOL

# Install dependencies
npm install --production

# 7. Setup Database
echo "正在配置数据库..."
# No need to create DB user for SQLite
# Ensure the directory is writable
chmod 775 .


# Run Prisma migrations
npx prisma migrate deploy

# 8. Start Backend with PM2
echo "正在重启后端服务..."
pm2 delete personal-website-backend || true

# Aggressive port cleanup
echo "正在清理端口 3001..."
# Kill any process on port 3001
fuser -k 3001/tcp || true
# Kill all node processes to be safe (since we are restarting)
killall -9 node || true

# Wait for port release
sleep 3

pm2 start dist/index.js --name "personal-website-backend"
pm2 save
pm2 startup | tail -n 1 | bash || true

# 9. Setup Nginx
echo "正在配置 Nginx..."
sudo tee /etc/nginx/sites-available/personal-website << 'EOL'
server {
    listen 80;
    server_name _;  # Replace with your domain if you have one

    root /var/www/personal-website/frontend/dist;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads {
        alias /var/www/personal-website/backend/uploads;
    }
}
EOL

sudo ln -sf /etc/nginx/sites-available/personal-website /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "部署完成！请访问 http://42.194.162.51"
