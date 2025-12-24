#!/bin/bash

# 遇到错误立即停止
set -e

echo "=== 开始服务器环境初始化 ==="

# 1. 更新系统并安装基础工具
sudo apt-get update
sudo apt-get install -y curl git nginx psmisc unzip

# 2. 安装 Node.js 18
if ! command -v node &> /dev/null; then
    echo "安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js 已安装: $(node -v)"
fi

# 3. 安装 PM2
if ! command -v pm2 &> /dev/null; then
    echo "安装 PM2..."
    sudo npm install -g pm2
fi

# 4. 设置项目目录
TARGET_DIR="/var/www/personal-website"
sudo mkdir -p $TARGET_DIR
sudo chown -R $USER:$USER $TARGET_DIR

# 5. 部署文件 (假设文件已上传到 ~/deployment)
echo "=== 正在部署文件 ==="

# 清理旧的前端文件 (保留目录结构)
if [ -d "$TARGET_DIR/frontend" ]; then
    echo "清理旧的前端文件..."
    rm -rf $TARGET_DIR/frontend/*
fi

# 清理旧的后端代码 (保留 uploads, .env, dev.db)
if [ -d "$TARGET_DIR/backend/dist" ]; then
    echo "清理旧的后端代码..."
    rm -rf $TARGET_DIR/backend/dist
fi

# 复制新文件
# 注意：这里假设 ~/deployment/frontend 里面包含 dist 文件夹
# 如果 ~/deployment/frontend 里面直接就是 index.html，请修改 Nginx 配置
cp -r ~/deployment/frontend $TARGET_DIR/
cp -r ~/deployment/backend $TARGET_DIR/

# 6. 配置后端
echo "=== 正在配置后端 ==="
cd $TARGET_DIR/backend

# 创建 .env (仅当文件不存在时创建，避免覆盖生产环境密钥)
if [ ! -f .env ]; then
    echo "创建新的 .env 文件..."
    cat > .env << EOL
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-key-change-this" # 部署后记得修改这个！
NODE_ENV="production"
EOL
else
    echo ".env 文件已存在，跳过创建。"
fi

# 安装依赖
echo "安装后端依赖..."
npm install --production

# 7. 配置数据库
echo "=== 正在配置数据库 ==="

# 关键：生成 Prisma Client (修复 Property does not exist 报错)
echo "生成 Prisma Client..."
npx prisma generate

# 运行数据库迁移
echo "应用数据库迁移..."
# 确保包含 dev.db 的目录有写入权限
chmod 775 .
npx prisma migrate deploy

# 8. 重启后端服务
echo "=== 正在重启后端服务 ==="

# 清理端口 3001 (仅针对特定端口，更安全)
fuser -k 3001/tcp || true

# 仅重启当前项目，而不是 killall node
pm2 delete personal-website-backend || true
pm2 start dist/index.js --name "personal-website-backend"
pm2 save

# 9. 配置 Nginx
echo "=== 正在配置 Nginx ==="
sudo tee /etc/nginx/sites-available/personal-website << 'EOL'
server {
    listen 80;
    server_name _;  # 如果有域名，请在这里替换下划线，如: server_name mywebsite.com;

    # 这里假设你的 dist 在 /frontend/dist 下
    root /var/www/personal-website/frontend/dist;
    index index.html;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 图片上传目录代理
    location /uploads {
        alias /var/www/personal-website/backend/uploads;
        expires 30d;
    }
}
EOL

sudo ln -sf /etc/nginx/sites-available/personal-website /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试并重启 Nginx
if sudo nginx -t; then
    sudo systemctl restart nginx
    echo "✅ 部署成功！"
    echo "请访问: http://42.194.162.51"
else
    echo "❌ Nginx 配置有误，请检查。"
    exit 1
fi