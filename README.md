# 个人作品集网站 (Personal Portfolio Website)

一个现代化、全栈开发的个人作品集网站。包含精美的前端展示页面和功能强大的后台管理系统。

## 📸 项目预览

### 前台展示
- **极简设计**：参考 Apple 官网风格，响应式布局，适配移动端和桌面端。
- **动态内容**：所有内容（个人简介、技能、经历、项目、摄影作品）均通过后台动态配置。
- **摄影画廊**：支持瀑布流展示，自动提取并显示照片 EXIF 信息（光圈、快门、ISO 等）。
- **交互体验**：使用 Framer Motion 实现流畅的动画效果。

### 后台管理
- **仪表盘**：访问量统计、最新留言概览。
- **项目管理**：
  - 支持 **Markdown** 编辑器编写项目详情。
  - 支持 **拖拽排序** (Drag & Drop) 调整项目显示顺序。
  - 支持多图上传与预览。
- **摄影管理**：
  - 批量上传与自动压缩处理。
  - 批量分类、批量删除。
  - 自动读取照片 EXIF 元数据。
- **留言管理**：查看访客留言，支持标记已读、回复（模拟邮件调用）和批量删除。
- **经历与技能**：可视化的增删改查管理。
- **系统设置**：配置网站标题、SEO 关键词、ICP 备案号，修改管理员密码。

---

## 🛠 技术栈

### 前端 (Frontend)
- **核心框架**：React 18 + TypeScript + Vite
- **UI 库**：Tailwind CSS (前台), Ant Design (后台)
- **状态/交互**：Axios, Framer Motion, React Router v6
- **高级组件**：
  - `@dnd-kit`: 实现列表拖拽排序
  - `react-simplemde-editor`: Markdown 编辑器
  - `yet-another-react-lightbox`: 图片灯箱效果

### 后端 (Backend)
- **运行时**：Node.js + Express
- **数据库**：SQLite (通过 Prisma ORM 管理，部署轻便)
- **工具库**：
  - `prisma`: ORM 与 数据库迁移
  - `multer`: 文件上传处理
  - `sharp`: 图片压缩与缩略图生成
  - `exifr`: 照片 EXIF 信息提取
  - `jsonwebtoken`: JWT 身份认证

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

本项目包含自动化部署脚本，支持 Windows 本地打包和 Linux (Ubuntu) 服务器一键部署。

### 1. 本地打包 (Windows)

在项目根目录下运行 PowerShell 脚本：

```powershell
./package_deployment.ps1
```

该脚本会自动：
1. 编译前端 (`npm run build`)
2. 编译后端 (`tsc`)
3. 整理必要文件（排除 `node_modules`）
4. 生成 `deployment.zip` 压缩包

### 2. 上传至服务器

使用 SCP 将压缩包上传到服务器（假设服务器用户为 `ubuntu`）：

```bash
scp deployment.zip ubuntu@your_server_ip:~/deployment.zip
```

### 3. 服务器部署 (Ubuntu)

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


