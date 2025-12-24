# 小白友好版个人网站部署教程

## 前言

本教程将一步步教你如何将个人网站部署到云服务器上，适合完全没有服务器经验的小白。我们使用阿里云服务器作为示例，其他云服务商（如腾讯云、华为云）操作类似。

## 准备工作

### 1. 购买云服务器

#### 1.1 选择云服务商
- 推荐：阿里云（https://www.aliyun.com/）或腾讯云（https://cloud.tencent.com/）
- 优势：操作界面友好，新手友好，有学生优惠

#### 1.2 购买服务器
1. 打开阿里云官网，注册并登录账号
2. 进入「云服务器ECS」页面
3. 点击「立即购买」
4. 配置选择：
   - 地域：选择离你最近的地域（如华东1、华北1等）
   - 实例规格：推荐「共享型 n4.small」（1核2G，适合个人网站）
   - 镜像：选择「Ubuntu 22.04 LTS 64位」
   - 存储：40GB 高效云盘
   - 网络：默认配置即可
   - 公网IP：选择「分配公网IPv4地址」
   - 安全组：勾选「允许SSH(22)」、「允许HTTP(80)」、「允许HTTPS(443)」
   - 登录凭证：选择「自定义密码」，设置一个强密码（至少8位，包含大小写字母、数字和符号）
5. 确认订单并支付

#### 1.3 获取服务器信息
- 购买完成后，进入「云服务器ECS」管理控制台
- 找到你购买的服务器，记录下「公网IP」

### 2. 准备本地工具

#### 2.1 安装PuTTY（用于SSH连接服务器）
- 下载地址：https://www.putty.org/
- 安装：一路点击「下一步」即可

#### 2.2 安装WinSCP（用于文件传输，可选）
- 下载地址：https://winscp.net/eng/index.php
- 安装：一路点击「下一步」即可

## 第一步：连接服务器

### 1. 使用PuTTY连接服务器
1. 打开PuTTY
2. 在「Host Name (or IP address)」中输入你的服务器公网IP
3. 「Port」保持默认的22
4. 点击「Open」
5. 首次连接会弹出安全提示，点击「Yes」
6. 输入用户名：`root`
7. 输入你在购买服务器时设置的密码（输入时屏幕上不会显示，输完直接按回车）
8. 成功连接后，你会看到服务器的命令行界面

## 第二步：服务器初始配置

### 1. 更新系统
在PuTTY的命令行中输入以下命令，然后按回车：
```bash
apt update && apt upgrade -y
```

### 2. 安装Node.js 18.x
依次输入以下命令，每次输入后按回车：
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

### 3. 安装Git
```bash
apt install -y git
```

### 4. 安装Nginx（用于静态文件服务和反向代理）
```bash
apt install -y nginx
```

### 5. 安装PM2（用于管理Node.js进程）
```bash
npm install -g pm2
```

## 第三步：部署后端

### 1. 创建项目目录
```bash
mkdir -p /var/www/personal-website
cd /var/www/personal-website
```

### 2. 克隆后端代码
将 `<your-repository-url>` 替换为你的Git仓库地址，然后运行：
```bash
git clone <your-repository-url> backend
cd backend
```

### 3. 安装依赖
```bash
npm install
```

### 4. 配置环境变量
```bash
# 创建.env文件
cp .env.example .env

# 编辑.env文件
nano .env
```

进入编辑模式后，按如下配置修改文件内容：
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

编辑完成后，按 `Ctrl + O` 保存，然后按 `Ctrl + X` 退出编辑模式。

### 5. 构建项目
```bash
npm run build
```

### 6. 初始化数据库
```bash
# 运行数据同步脚本
npm run sync-data
```

### 7. 使用PM2启动后端服务
```bash
# 启动服务
pm start

# 使用PM2管理进程
pm install -g pm2
pm run pm2:start

# 设置PM2开机自启
npm run pm2:setup
```

如果你的package.json中没有这些脚本，手动执行：
```bash
# 直接使用PM2启动
pm run build
pm start
```

## 第四步：部署前端

### 1. 克隆前端代码
```bash
cd /var/www/personal-website
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

进入编辑模式后，修改以下配置：
```
VITE_API_BASE_URL="http://你的服务器公网IP:3001/api"
```

编辑完成后，按 `Ctrl + O` 保存，然后按 `Ctrl + X` 退出编辑模式。

### 4. 构建前端项目
```bash
npm run build
```

### 5. 部署前端文件
```bash
# 将构建后的文件复制到Nginx静态目录
cp -r dist/* /var/www/html/
```

## 第五步：配置Nginx

### 1. 备份默认配置
```bash
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
```

### 2. 编辑Nginx配置
```bash
nano /etc/nginx/sites-available/default
```

进入编辑模式后，将默认配置替换为以下内容：
```nginx
server {
    listen 80;
    server_name 你的服务器公网IP;

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
}
```

编辑完成后，按 `Ctrl + O` 保存，然后按 `Ctrl + X` 退出编辑模式。

### 3. 测试Nginx配置
```bash
nginx -t
```

如果显示 "nginx: configuration file /etc/nginx/nginx.conf test is successful"，说明配置正确。

### 4. 重启Nginx
```bash
systemctl restart nginx
```

## 第六步：测试网站

### 1. 访问网站首页
在浏览器中输入你的服务器公网IP，你应该能看到网站首页。

### 2. 测试登录功能
访问 `http://你的服务器公网IP/login`，使用默认账号密码登录：
- 邮箱：admin@example.com
- 密码：password123

### 3. 测试API访问
访问 `http://你的服务器公网IP/api/photos`，你应该能看到JSON格式的照片数据。

## 常见问题及解决方法

### 1. 无法连接服务器
- 检查服务器公网IP是否正确
- 检查安全组是否允许SSH(22)端口
- 检查本地网络是否正常

### 2. 后端服务无法启动
- 检查端口是否被占用：`lsof -i :3001`
- 检查PM2日志：`pm2 logs`
- 检查Node.js版本：`node -v`（需要18.x或更高版本）

### 3. 前端无法访问后端API
- 检查Nginx配置是否正确
- 检查防火墙是否开放3001端口：`ufw allow 3001`
- 检查后端服务是否正在运行：`pm2 status`

### 4. 网站无法访问
- 检查Nginx是否正在运行：`systemctl status nginx`
- 检查防火墙是否开放80端口：`ufw allow 80`
- 检查前端文件是否正确部署到 `/var/www/html/` 目录：`ls -la /var/www/html/`

### 5. 数据库连接失败
- 检查DATABASE_URL配置是否正确
- 重新运行数据同步脚本：`npm run sync-data`

## 后续维护

### 1. 更新代码
当你的代码有更新时，执行以下命令：
```bash
# 更新后端
cd /var/www/personal-website/backend
git pull
npm install
npm run build
npm run sync-data
pm run pm2:restart

# 更新前端
cd /var/www/personal-website/frontend
git pull
npm install
npm run build
cp -r dist/* /var/www/html/
systemctl restart nginx
```

### 2. 查看日志
- 查看后端日志：`pm2 logs`
- 查看Nginx日志：`tail -f /var/log/nginx/access.log`

### 3. 重启服务
- 重启后端服务：`pm2 restart all`
- 重启Nginx：`systemctl restart nginx`

## 恭喜！

你已经成功部署了个人网站！现在你可以通过服务器IP访问你的网站，分享给你的朋友和家人了。

如果你想使用域名访问网站，你需要购买一个域名，并将域名解析到你的服务器IP，然后重新配置Nginx。

## 进阶：配置HTTPS

如果你有域名，可以配置HTTPS，让网站更安全：

1. 安装Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

2. 申请SSL证书
将 `your_domain.com` 替换为你的域名，然后运行：
```bash
certbot --nginx -d your_domain.com
```

3. 按照提示完成配置

4. 测试HTTPS访问
在浏览器中输入 `https://your_domain.com`，你应该能看到带有绿色锁图标的安全网站。

## 部署脚本

为了简化部署流程，你可以创建一个部署脚本：

1. 创建脚本文件
```bash
nano /var/www/personal-website/deploy.sh
```

2. 输入以下内容：
```bash
#!/bin/bash

echo "开始部署个人网站..."

# 1. 更新后端
echo "更新后端..."
cd /var/www/personal-website/backend
git pull
npm install
npm run build
npm run sync-data
pm run pm2:restart

# 2. 更新前端
echo "更新前端..."
cd /var/www/personal-website/frontend
git pull
npm install
npm run build
cp -r dist/* /var/www/html/

# 3. 重启Nginx
echo "重启Nginx..."
systemctl restart nginx

echo "部署完成！"
```

3. 保存并退出：`Ctrl + O`，然后 `Ctrl + X`

4. 赋予脚本执行权限：`chmod +x /var/www/personal-website/deploy.sh`

5. 运行脚本：`/var/www/personal-website/deploy.sh`

现在，每次你需要更新网站时，只需要运行这个脚本即可。

## 总结

本教程详细介绍了如何将个人网站部署到云服务器上，包括服务器购买、初始配置、前后端部署、Nginx配置、常见问题解决方法等。只要你按照教程一步步操作，即使是完全没有服务器经验的小白也能成功部署网站。

祝你部署成功！