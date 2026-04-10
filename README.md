# 个人作品集网站 (Personal Portfolio Website)

一个现代化、全栈开发的个人作品集网站。包含精美的前端展示页面和功能强大的后台管理系统。

## 📸 项目预览

### 前台展示
- **极简设计**：参考 Apple 官网风格，响应式布局，适配移动端和桌面端，支持日间/夜间模式切换。
- **动态内容**：所有内容（个人简介、技能、经历、项目、摄影作品、日常与兴趣）均通过后台动态配置。
- **摄影画廊**：支持瀑布流展示，自动提取并显示照片 EXIF 信息（相机型号、镜头、光圈、快门、ISO 等）。
- **交互体验**：使用 Framer Motion 实现流畅的滚动视差、元素进入动画和页面切换效果。
- **音乐时光**：集成网易云音乐和QQ音乐解析，拥有带毛玻璃效果的定制化悬浮音乐播放器和滚动歌词功能。
- **日常与兴趣**：
  - **动态发布**：展示类似微信朋友圈的图文动态。
  - **影音记录**：展示电影、电视剧的观看记录。
  - **旅行足迹**：结合地图展示去过的城市和旅行打卡点。
  - **热点资讯**：实时抓取并展示每日全网热点新闻。
  - **实时天气**：基于 IP 自动定位，展示当地实时天气和未来三天预报。
- **AI 助手与弹幕**：全局悬浮 AI 聊天助手以及实时互动的全屏弹幕功能。

### 后台管理
- **仪表盘**：全站数据统计概览、最新留言和动态提示。
- **项目管理**：
  - 支持 **Markdown** 编辑器编写项目详情。
  - 支持 **拖拽排序** (Drag & Drop) 调整项目显示顺序。
  - 支持项目展示图上传及外部链接嵌入。
- **摄影管理**：
  - 支持照片直传与自动生成缩略图，大幅优化加载速度。
  - 自动读取照片 EXIF 元数据，支持批量分类管理。
- **留言管理**：查看访客留言，支持标记已读和删除。
- **音乐与影视管理**：通过 URL 一键解析网易云/QQ音乐直链与歌词，管理观影记录。
- **动态与足迹管理**：发布图文动态，管理旅行去过的省份和城市。
- **弹幕管理**：审核和管理前台访客发送的弹幕。
- **经历与技能**：可视化的个人履历与专业技能进度条管理。
- **系统设置**：全局配置网站标题、站长信息、社交链接、SEO 关键词、ICP 备案号，以及修改管理员密码。

---

## 🛠 技术栈

### 前端 (Frontend)
- **核心框架**：React 18.3.1 + TypeScript 5.6.2 + Vite 5.4.8
- **UI 库**：Tailwind CSS 3.4.13 (前台), Ant Design 6.1.1 (后台)
- **状态/交互**：Axios, Framer Motion 12.23.26, React Router v6.26.2
- **高级组件**：
  - `@dnd-kit`: 实现列表拖拽排序
  - `react-simplemde-editor`: Markdown 编辑器
  - `yet-another-react-lightbox`: 图片灯箱效果
  - `chart.js` + `react-chartjs-2`: 数据可视化图表
  - `echarts` + `recharts`: 高级图表库
  - `json2csv`: CSV 数据导出

### 后端 (Backend)
- **运行时**：Node.js + Express
- **数据库**：SQLite (通过 Prisma ORM 管理，部署轻便)
- **工具库**：
  - `prisma`: ORM 与 数据库迁移
  - `multer`: 文件上传处理
  - `sharp`: 图片压缩与缩略图生成
  - `exifr`: 照片 EXIF 信息提取
  - `jsonwebtoken`: JWT 身份认证
  - `bcryptjs`: 密码加密

---

## 🚀 快速开始 (本地开发)

### 环境要求
- Node.js 18+
- npm 或 yarn

### 1. 后端设置

```bash
cd backend

# 安装依赖
npm install

# 初始化数据库 (SQLite)
# 这将创建 /prisma/dev.db 并应用迁移
npx prisma migrate dev --name init

# (可选) 填充初始数据
npx ts-node prisma/seed.ts

# 启动开发服务器 (默认端口 3001)
npm run dev
```

### 2. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器 (默认端口 3000)
npm run dev
```

访问 `http://localhost:3000` 查看前台，访问 `http://localhost:3000/admin` 进入后台管理（默认账号需在数据库初始化时设置，或查看 `prisma/seed.ts`）。

---

## 📦 部署指南

### 方式一：自动化部署脚本

本项目包含自动化部署脚本，支持 Windows 本地打包和 Linux (Ubuntu) 服务器一键部署。

#### 1. 本地打包 (Windows)

在项目根目录下运行 PowerShell 脚本：

```powershell
./package_deployment.ps1
```

该脚本会自动：
1. 编译前端 (`npm run build`)
2. 编译后端 (`tsc`)
3. 整理必要文件（排除 `node_modules`）
4. 生成 `deployment.zip` 压缩包

#### 2. 上传至服务器

使用 SCP 将压缩包上传到服务器（假设服务器用户为 `ubuntu`）：

```bash
scp deployment.zip ubuntu@your_server_ip:~/deployment.zip
```

#### 3. 服务器部署 (Ubuntu)

登录服务器并运行以下命令：

```bash
# 解压
unzip -o deployment.zip -d deployment

# 赋予脚本执行权限
chmod +x deployment/setup_server.sh

# 执行部署脚本
cd deployment
./setup_server.sh
```

`setup_server.sh` 脚本会自动：
- 安装 Node.js, PM2, Nginx 等环境
- 配置 Nginx 反向代理
- 自动处理数据库迁移
- 使用 PM2 启动后端服务
- 部署前端静态资源

### 方式二：手动部署

#### 1. 前端部署

```bash
cd frontend

# 构建生产版本
npm run build

# 将构建产物上传到服务器
scp -r dist/* ubuntu@your_server_ip:/var/www/personal-website
```

#### 2. 后端部署

```bash
cd backend

# 编译 TypeScript
npm run build

# 复制必要文件到服务器
scp -r dist/ prisma/ package.json package-lock.json ubuntu@your_server_ip:/opt/personal-website-backend

# 登录服务器安装依赖并启动
ssh ubuntu@your_server_ip
cd /opt/personal-website-backend
npm install --production
npx prisma migrate deploy
npx pm2 start dist/index.js --name personal-website-backend
```

#### 3. Nginx 配置

在服务器上创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/personal-website
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    # 前端静态资源
    location / {
        root /var/www/personal-website;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置并重启 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/personal-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📂 项目结构

```
.
├── backend/                 # 后端源码
│   ├── prisma/              # 数据库模型与迁移
│   ├── src/
│   │   ├── controllers/     # 业务逻辑
│   │   ├── routes/          # API 路由
│   │   ├── middleware/      # 中间件 (Auth, Error, Upload)
│   │   └── utils/           # 工具函数
│   └── uploads/             # 上传文件存储目录
│
├── frontend/                # 前端源码
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── pages/
│   │   │   ├── Admin/       # 后台管理页面
│   │   │   ├── demos/       # 演示功能页面
│   │   │   └── ...          # 前台展示页面
│   │   ├── context/         # 全局状态 (Auth)
│   │   └── utils/
│   └── dist/                # 构建产物
│
├── deployment/              # 部署相关脚本
│   └── setup_server.sh      # 服务器初始化脚本
├── package_deployment.ps1   # Windows 打包脚本
└── README.md
```

---

## 🔧 开发说明

### 前端开发

- 使用 Vite 作为构建工具，支持热更新
- 使用 Tailwind CSS 进行样式开发
- 使用 TypeScript 确保类型安全
- 使用 ESLint 进行代码质量检查

### 后端开发

- 使用 Prisma 作为 ORM，简化数据库操作
- 使用 Express 构建 RESTful API
- 使用 nodemon 支持热更新
- 使用 JWT 进行身份验证

---

## 📝 功能特性

### 前台功能

| 功能模块 | 描述 |
|---------|------|
| 首页 | 个人简介、最新动态、技能展示、悬浮 AI 助手 |
| 经历 | 个人成长、教育与工作经历时间轴 |
| 技能 | 按分类（前端、后端、DevOps等）以进度条及动画形式展示的专业技能 |
| 项目 | 个人项目展示（支持 Markdown 详情、展示图和在线 Demo 链接） |
| 摄影 | 瀑布流画廊、自动提取相机的 EXIF 元数据并叠加水印展示 |
| 日常 | 朋友圈式图文动态、观影记录、热点资讯、基于IP定位的实时天气预报 |
| 音乐 | 自研定制化音乐播放器，支持歌词滚动，接入网易云/QQ音乐 |
| 留言 | 访客留言表单，支持留言并记录到后台 |
| 弹幕 | 全局实时滚动的互动弹幕，支持访客发送 |

### 后台功能

| 功能模块 | 描述 |
|---------|------|
| 仪表盘 | 全站核心数据统计、快捷入口、最新动态通知 |
| 动态管理 | 发布与编辑图文动态 |
| 项目管理 | 增删改查、拖拽排序、图片上传、Markdown 详情编辑 |
| 摄影管理 | 批量图片上传与压缩、分类管理、EXIF 自动提取写入 |
| 音乐管理 | 一键解析网易云/QQ音乐链接与歌词，管理歌单 |
| 影视管理 | 记录与展示看过的电影、电视剧及封面 |
| 足迹管理 | 管理旅行去过的省份与城市坐标 |
| 留言管理 | 查看访客留言、标记已读、删除 |
| 弹幕管理 | 审核访客发送的弹幕内容 |
| 经历与技能 | 可视化管理履历与专业技能进度条 |
| 系统设置 | 全局网站配置（标题、ICP备案号、社交链接）、密码修改 |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License
