# 首页内容入库（2026-11）· 生产操作步骤

目的：给 `project / experience / skill` 加可空新列，再把**当前首页展示的内容**一次性写进数据库
（`scripts/sync_homepage_content.ts`，数据在 `scripts/homepage_content.data.ts`）。之后首页读 DB，后台改动直接生效。

## 为什么不用 `prisma migrate`

- `prisma/migrations/` 里只有两条 **PostgreSQL** 迁移（`migration_lock.toml` = postgresql），而数据源是 MySQL：
  任何 `prisma migrate deploy / dev / status` 都会直接报 **P3019**（见 `backend/migrate_error.txt`）。
- 生产库实际是用 `prisma db push` 建的（schema 里的 music/movie/travel/danmaku/dream_* 等表没有任何迁移）。
- 因此：**不要**在生产运行 `prisma migrate dev`（会提示重置=清空数据库）、`migrate reset`、`migrate deploy`，
  也**不要** `prisma db push`（它会顺带同步其它未知漂移）。只执行下面这一个 SQL 文件。
- 该 SQL 只有 3 条 `ALTER TABLE … ADD COLUMN … NULL`，不改数据；每条 ALTER 是原子的，重复执行会报
  `Duplicate column name` 并且不做任何改动。

## 顺序（重要）

旧后端可以兼容新列（新列可空，旧 Prisma Client 不查它们）；**新后端没有新列会直接报错**。
所以：**先迁移 → 再部署新后端 → 再同步内容**。

以下命令都在后端目录执行（服务器上是部署目录，开发机上是 `backend/`），`DATABASE_URL` 取自 `.env`，
或在命令前内联 `DATABASE_URL='mysql://…'`。

### 1. 备份数据库

腾讯云 CynosDB 控制台先做一次手动备份/快照，或：

```bash
mysqldump -h <host> -P <port> -u <user> -p --single-transaction --set-gtid-purged=OFF \
  <database> > backup_$(date +%F_%H%M).sql
```

（至少包含 `project experience skill social_media` 四张表。）

### 2. 预览迁移（只读）

```bash
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script
```

预期输出**恰好**是 `experience`、`project`、`skill` 三条 `ALTER TABLE … ADD COLUMN`，与
`prisma/migrations/20261120000000_homepage_content_fields/migration.sql` 一致。
若出现其它语句（DROP、别的表、改类型），说明生产还有别的漂移：**停下**，不要 `db push`，先排查；
本次仍然只执行下面的 SQL 文件。

### 3. 执行迁移

```bash
npx prisma db execute \
  --file prisma/migrations/20261120000000_homepage_content_fields/migration.sql \
  --schema prisma/schema.prisma
```

### 4. 校验迁移

再跑一次第 2 步，预期输出 `-- This is an empty migration.`（或只剩第 2 步里已存在的那部分旧漂移）。

### 5. 部署新后端

照常构建/发布（`npm run build`，确保 `prisma generate` 用的是新 schema），然后 `pm2 restart personal-website`。

### 6. 同步内容：先 Dry run（不写库）

脚本依赖 devDependencies（`ts-node`、`typescript`）和 `scripts/` 目录，生产发布包里没有，
建议在开发机的 `backend/` 下执行（`npm install` 后），内联指向生产库：

```bash
DATABASE_URL='mysql://…生产…' npm run sync-homepage
```

先确认第一行 `Target DB:` 是生产库，再逐条检查计划。按 2026-11-20 的线上数据，预期约
**29 项：11 create、5 update、13 hide**：

- 项目：`农业科研AI系统`→禾书耕文（flagship，orderIndex 0，demo 改为 ai4science）、`梦境拓卜`→梦境拓扑、
  `界外 Outbounds` 更新文案；新建「饭定了」。图片/GitHub 保留库里的（与首页现状一致）。
- 经历：新建 洋葱教育 FDE、智慧农业创新中心、中国联通；更新 AIFA、个人项目；隐藏 L0VE 黑客松、两条 Trae、线下创业。
- 技能：新建 6 条 `category='capability'`；9 条旧百分比技能 `isVisible=false`（不删除）。
- 联系方式：给 user 1 新建 `GitHub → https://github.com/hyxhhh1013`（不改 `User.email` / `location`）。

脚本**从不删除**任何行，只会改文案/排序或把不匹配的行设为隐藏。

### 7. 执行同步

```bash
DATABASE_URL='mysql://…生产…' npm run sync-homepage -- --apply
```

所有写入在**一个事务**里，失败会整体回滚。成功后脚本会自动复查，最后一行应为
`Second pass: no changes.`

### 8. 重启后端（刷新内存缓存）

列表接口有进程内缓存（项目/技能最长 1 小时），执行：`pm2 restart personal-website`。

### 9. 验证

```bash
DATABASE_URL='mysql://…生产…' npm run sync-homepage    # 预期：no changes
curl -s 'https://hyxhhh.site/api/projects?limit=100' | head -c 600   # 应能看到 badge / titleEn
```

打开首页，确认四个板块与同步前一致；在后台改一条文案，首页刷新后应生效。

## 回滚

- 内容：用第 1 步的备份恢复这四张表。
- 列：可以一直保留（可空、旧代码不读）。只有同时回滚代码时才需要
  `ALTER TABLE … DROP COLUMN …`（新后端依赖这些列）。
