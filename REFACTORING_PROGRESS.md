# 项目重构进度与后台修复计划

## 1. 当前项目结构概述
项目正在从前后端分离架构（Express + Vite/React）重构为全栈 Next.js (App Router) 架构。

- **原项目 (主文件夹)**:
  - `backend/`: 原 Node.js (Express) 后端，使用 PostgreSQL 数据库。
  - `frontend/`: 原 Vite + React 前端。
- **重构项目 (`next-app/`)**:
  - 采用 **Next.js 15 (App Router)**、React 19。
  - 数据库迁移至 **PostgreSQL** (通过 `@prisma/adapter-pg` 和 Prisma ORM 管理)。
  - UI 采用 Tailwind CSS v4, Framer Motion。

## 2. 重构进度总结

### ✅ 已完成部分 (前端)
1. **页面与路由迁移**: 基础页面（首页、Admin后台界面、Demo页面、日常与兴趣等）已经搭建。
2. **UI组件迁移**: Navbar/Header, Sections组件, 动画效果 (ParticleBackground) 基本完成迁移。
3. **导航逻辑修复**: 修复了在非主页（如 `/login`, `/admin` 等）点击锚点链接（如“首页”、“项目”）导致导航失效、指向混乱的 BUG。已将单一的 `pathname === '/interests'` 判断修改为更通用的 `pathname !== '/'`。

### ⚠️ 进行中/混乱部分 (后台)
虽然在 `next-app/src/app/api` 下创建了大量 API 路由（如 `auth`, `projects`, `users`, `photos` 等），且 Prisma Schema 已经定义好 (`User`, `Project`, `Moment`, 等模型），但**后台逻辑处于完全混乱的状态**：

1. **临时代码与硬编码残留**: 例如 `auth/login/route.ts` 并没有对接 Prisma 数据库，而是使用了名为 `users` 的临时内存数组，导致数据库内的真实用户无法登录。
2. **TypeScript 报错**:
   - `src/app/api/users/[id]/avatar/route.ts`: 存在类型错误 (`Type 'string' is not assignable to type 'null'`)。
   - 依赖与变量未定义错误（如 `FocusFlowMiniDemo.tsx` 中 `interval` 使用前未赋值）。
3. **认证与权限校验缺失**: 没有统一的 Next.js Middleware 或一致的 JWT 验证方案来保护 `/api/admin/*` 和相关需要授权的增删改查接口。
4. **数据操作逻辑不统一**: 部分接口使用了 Prisma 正确进行数据库查询，部分接口逻辑还未完善，可能存在 Express `req/res` 语法的错误残留。

---

## 3. 后台修复计划 (Backend Repair Plan)

为了解决 `next-app` 后端混乱的问题，建议按照以下阶段进行有序修复：

### 第一阶段：统一数据库连接与修复认证逻辑 (核心)
- **修复登录接口**: 重写 `src/app/api/auth/login/route.ts`，移除内存数组，改为通过 `prisma.user.findUnique({ where: { email } })` 验证用户，并正确校验 `bcrypt` 密码。
- **完善 JWT 工具**: 确保 Token 签发与解析逻辑健壮，将环境变量 `JWT_SECRET` 配置到 `.env` 并增加容错处理。
- **添加中间件拦截 (Middleware)**: 在 `next-app/src/middleware.ts` 中实现全局或针对 `/api/admin` 和 `/admin` 路由的 JWT Token 校验，避免每个 API 内部重复写鉴权逻辑。

### 第二阶段：修复 TypeScript 与构建错误 (Build Errors)
- 逐一排查并解决 `tsc_errors.txt` 中的报错：
  - 修复 `users/[id]/avatar/route.ts` 中的类型分配问题。
  - 修复前端 Demo 组件 (`FocusFlowMiniDemo.tsx`) 的变量作用域问题。
  - 解决 Next.js 路由类型生成的类型声明报错 (`routes.d.ts`)。

### 第三阶段：重构与审查全部 API 路由 (API Audit)
由于目前 API 目录非常庞大，需要按业务模块进行审查：
1. **统一 Response 格式**: 建立通用的响应封装函数，如 `successResponse(data)`, `errorResponse(message, status)`，确保所有接口返回数据结构一致（如 `{ status: 'success', data: ... }`）。
2. **CRUD 标准化**: 检查每个模块（如 `projects`, `moments`, `movies`, `musics`, `photos` 等）的 `GET`, `POST`, `PUT`, `DELETE` 请求：
   - 是否正确使用 `NextRequest` 和 `await req.json()` 取值。
   - 是否包含必要的异常捕获 (`try...catch`)。
   - 涉及到关联数据或分页的数据，是否使用了正确的 Prisma 语法。

### 第四阶段：测试与环境联调
- **数据库一致性确认**: 经查，原 `backend` 和新 `next-app` 使用的是完全相同的远程 PostgreSQL 数据库，**无需进行数据迁移和同步**，数据天然互通。
- **接口联调验证**: 配合 Admin 后台界面，跑通完整的数据展示、上传（图片上传接口）、修改和删除流程。
