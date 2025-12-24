# 个人网站部署指南

## 准备工作

### 1. 云服务器选择
- 推荐使用阿里云、腾讯云、AWS等主流云服务提供商
- 系统选择：Ubuntu 22.04 LTS（稳定、易用）
- 配置建议：至少1核2G内存，40G硬盘

### 2. 服务器初始配置

#### 2.1 连接服务器
```bash
# 使用SSH连接服务器
ssh root@your_server_ip
```

#### 2.2 更新系统
```bash
apt update && apt upgrade -y
```

#### 2.3 安装必要软件
```bash
# 安装Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs git nginx

# 安装PM2（用于管理Node.js进程）
npm install -g pm2
```

#### 2.4 配置防火墙
```bash
# 允许SSH、HTTP、HTTPS和后端API端口
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3001
ufw enable
```

## 后端部署

### 1. 克隆代码
```bash
# 创建项目目录
mkdir -p /var/www/personal-website
cd /var/www/personal-website

# 克隆后端代码
git clone <your-repository-url> backend
cd backend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
# 创建.env文件
cp .env.example .env

# 编辑.env文件
nano .env
```

在.env文件中配置以下内容：
```
# 服务器配置
PORT=3001
NODE_ENV=production

# 数据库配置
DATABASE_URL="file:./dev.db"

# JWT配置
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="30d"

# CORS配置
CORS_ORIGIN="*"
```

### 4. 构建项目
```bash
npm run build
```

### 5. 初始化数据库
```bash
# 运行数据同步脚本
npm run sync-data
```

### 6. 使用PM2启动后端服务
```bash
# 启动服务
pm start

# 使用PM2管理进程
pm install -g pm2
pm run pm2:start

# 设置PM2开机自启
pm run pm2:setup
```

**如果package.json中没有这些脚本，手动执行：**
```bash
# 启动服务
pm run build
pm start

# 使用PM2管理进程
pm install -g pm2
pm run build
pm run pm2:start

# 设置PM2开机自启
pm run pm2:setup
```

## 前端部署

### 1. 克隆代码
```bash
cd /var/www/personal-website

# 克隆前端代码
git clone <your-repository-url> frontend
cd frontend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
# 创建.env文件
cp .env.example .env

# 编辑.env文件
nano .env
```

在.env文件中配置以下内容：
```
VITE_API_BASE_URL="http://your_server_ip:3001/api"
```

### 4. 构建项目
```bash
npm run build
```

### 5. 部署前端文件
```bash
# 将构建后的文件复制到Nginx静态目录
cp -r dist/* /var/www/html/
```

## Nginx配置

### 1. 创建Nginx配置文件
```bash
# 备份默认配置
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# 创建新的配置文件
nano /etc/nginx/sites-available/personal-website
```

### 2. 编辑Nginx配置
```nginx
server {
    listen 80;
    server_name your_domain.com your_server_ip;

    # 前端静态文件配置
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端API反向代理
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存配置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/html;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

### 3. 启用配置并重启Nginx
```bash
# 创建符号链接
ln -s /etc/nginx/sites-available/personal-website /etc/nginx/sites-enabled/

# 检查配置是否正确
nginx -t

# 重启Nginx
systemctl restart nginx
```

## HTTPS配置（可选）

### 1. 安装Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 2. 申请SSL证书
```bash
certbot --nginx -d your_domain.com
```

### 3. 自动续期配置
```bash
# 设置自动续期定时器
systemctl enable certbot.timer
```

## 部署完成

现在你可以通过以下方式访问你的网站：
- 前端：http://your_server_ip 或 https://your_domain.com
- 后端API：http://your_server_ip:3001/api 或 https://your_domain.com/api
- 管理后台：http://your_server_ip/login 或 https://your_domain.com/login

## 常见问题

### 1. 后端服务无法启动
- 检查端口是否被占用：`lsof -i :3001`
- 检查PM2日志：`pm2 logs
- 检查Node.js版本：`node -v`（需要Node.js 18.x或更高版本）

### 2. 前端无法访问后端API
- 检查Nginx配置是否正确
- 检查防火墙是否开放3001端口
- 检查后端服务是否正在运行

### 3. 数据库连接失败
- 检查DATABASE_URL配置是否正确
- 检查数据库文件权限：`chmod 755 ./dev.db`
- 重新运行数据同步脚本：`npm run sync-data`

## 部署脚本

你可以创建一个部署脚本，简化部署流程：

```bash
#!/bin/bash

# 部署脚本

echo "开始部署个人网站..."

# 1. 更新代码
echo "更新代码..."
cd /var/www/personal-website/backend
git pull

cd /var/www/personal-website/frontend
git pull

# 2. 部署后端
echo "部署后端..."
cd /var/www/personal-website/backend
npm install
npm run build
npm run sync-data
pm run pm2:restart

# 3. 部署前端
echo "部署前端..."
cd /var/www/personal-website/frontend
npm install
npm run build
cp -r dist/* /var/www/html/

# 4. 重启Nginxecho "重启Nginx..."
systemctl restart nginx

echo "部署完成！"
```

## 总结

通过以上步骤，你可以将个人网站成功部署到云服务器上。部署完成后，建议定期更新代码和依赖，确保网站的安全性和稳定性。

祝你部署成功！
