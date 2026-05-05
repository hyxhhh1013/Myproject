/**
 * 存量 base64 图片 → 文件系统迁移脚本
 *
 * 运行方式: npx ts-node scripts/migrateBase64Images.ts
 * 功能: 扫描数据库中所有 base64 图片数据，写入 uploads/images/ 后更新记录
 */
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, '../uploads/images');

async function ensureDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

/**
 * 将单个 base64 字符串保存为文件, 返回相对路径
 * 如果不是 base64 图片则原样返回
 */
async function migrateField(value: string | null | undefined): Promise<string | null | undefined> {
  if (!value || !value.startsWith('data:image')) return value;

  const matches = value.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return value;

  try {
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = Buffer.from(matches[2], 'base64');
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    await fs.writeFile(path.join(UPLOADS_DIR, filename), data);
    const urlPath = `/uploads/images/${filename}`;
    console.log(`  ✓ 迁移成功: ${urlPath} (${(data.length / 1024).toFixed(1)} KB)`);
    return urlPath;
  } catch (err) {
    console.error(`  ✗ 迁移失败: ${(err as Error).message}`);
    return value; // 保留原值
  }
}

/**
 * 迁移 JSON 数组中的 base64 字符串
 */
async function migrateJsonArray(value: string | null | undefined): Promise<string | null | undefined> {
  if (!value) return value;

  let arr: string[];
  try {
    arr = JSON.parse(value);
    if (!Array.isArray(arr)) return value;
  } catch {
    return value; // 不是 JSON 数组，跳过
  }

  let changed = false;
  const migrated = await Promise.all(
    arr.map(async (item) => {
      if (typeof item === 'string' && item.startsWith('data:image')) {
        changed = true;
        return migrateField(item);
      }
      return item;
    })
  );

  return changed ? JSON.stringify(migrated) : value;
}

async function main() {
  console.log('=== Base64 图片迁移脚本 ===\n');
  await ensureDir();

  let totalMigrated = 0;

  // 1. User.avatar
  console.log('\n[User] avatar...');
  const users = await prisma.user.findMany({ select: { id: true, avatar: true } });
  for (const u of users) {
    if (u.avatar?.startsWith('data:image')) {
      const newVal = await migrateField(u.avatar);
      if (newVal && newVal !== u.avatar) {
        await prisma.user.update({ where: { id: u.id }, data: { avatar: newVal } });
        totalMigrated++;
      }
    }
  }

  // 2. Photo.imageUrl + thumbnailUrl
  console.log('\n[Photo] imageUrl, thumbnailUrl...');
  const photos = await prisma.photo.findMany({ select: { id: true, imageUrl: true, thumbnailUrl: true } });
  for (const p of photos) {
    const updates: any = {};
    const newUrl = await migrateField(p.imageUrl);
    if (newUrl && newUrl !== p.imageUrl) { updates.imageUrl = newUrl; totalMigrated++; }
    const newThumb = await migrateField(p.thumbnailUrl);
    if (newThumb && newThumb !== p.thumbnailUrl) { updates.thumbnailUrl = newThumb; totalMigrated++; }
    if (Object.keys(updates).length) {
      await prisma.photo.update({ where: { id: p.id }, data: updates });
    }
  }

  // 3. Project.imageUrl + images (JSON array)
  console.log('\n[Project] imageUrl, images...');
  const projects = await prisma.project.findMany({ select: { id: true, imageUrl: true, images: true } });
  for (const p of projects) {
    const updates: any = {};
    const newUrl = await migrateField(p.imageUrl);
    if (newUrl && newUrl !== p.imageUrl) { updates.imageUrl = newUrl; totalMigrated++; }
    const newImages = await migrateJsonArray(p.images);
    if (newImages && newImages !== p.images) { updates.images = newImages; totalMigrated++; }
    if (Object.keys(updates).length) {
      await prisma.project.update({ where: { id: p.id }, data: updates });
    }
  }

  // 4. Experience.images (JSON array)
  console.log('\n[Experience] images...');
  const experiences = await prisma.experience.findMany({ select: { id: true, images: true } });
  for (const e of experiences) {
    const newVal = await migrateJsonArray(e.images);
    if (newVal && newVal !== e.images) {
      await prisma.experience.update({ where: { id: e.id }, data: { images: newVal } });
      totalMigrated++;
    }
  }

  // 5. TravelCity.imageUrl + photos (JSON array)
  console.log('\n[TravelCity] imageUrl, photos...');
  const cities = await prisma.travelCity.findMany({ select: { id: true, imageUrl: true, photos: true } });
  for (const c of cities) {
    const updates: any = {};
    const newUrl = await migrateField(c.imageUrl);
    if (newUrl && newUrl !== c.imageUrl) { updates.imageUrl = newUrl; totalMigrated++; }
    const newPhotos = await migrateJsonArray(c.photos);
    if (newPhotos && newPhotos !== c.photos) { updates.photos = newPhotos; totalMigrated++; }
    if (Object.keys(updates).length) {
      await prisma.travelCity.update({ where: { id: c.id }, data: updates });
    }
  }

  // 6. TravelFootprint.photos (JSON array)
  console.log('\n[TravelFootprint] photos...');
  const footprints = await prisma.travelFootprint.findMany({ select: { id: true, photos: true } });
  for (const f of footprints) {
    const newVal = await migrateJsonArray(f.photos);
    if (newVal && newVal !== f.photos) {
      await prisma.travelFootprint.update({ where: { id: f.id }, data: { photos: newVal } });
      totalMigrated++;
    }
  }

  // 7. Moment.images (JSON array)
  console.log('\n[Moment] images...');
  const moments = await prisma.moment.findMany({ select: { id: true, images: true } });
  for (const m of moments) {
    const newVal = await migrateJsonArray(m.images);
    if (newVal && newVal !== m.images) {
      await prisma.moment.update({ where: { id: m.id }, data: { images: newVal } });
      totalMigrated++;
    }
  }

  // 8. Music.coverUrl
  console.log('\n[Music] coverUrl...');
  const musics = await prisma.music.findMany({ select: { id: true, coverUrl: true } });
  for (const m of musics) {
    const newVal = await migrateField(m.coverUrl);
    if (newVal && newVal !== m.coverUrl) {
      await prisma.music.update({ where: { id: m.id }, data: { coverUrl: newVal } });
      totalMigrated++;
    }
  }

  // 9. Movie.posterUrl + poster
  console.log('\n[Movie] posterUrl, poster...');
  const movies = await prisma.movie.findMany({ select: { id: true, posterUrl: true, poster: true } });
  for (const m of movies) {
    const updates: any = {};
    const newPosterUrl = await migrateField(m.posterUrl);
    if (newPosterUrl && newPosterUrl !== m.posterUrl) { updates.posterUrl = newPosterUrl; totalMigrated++; }
    const newPoster = await migrateField(m.poster);
    if (newPoster && newPoster !== m.poster) { updates.poster = newPoster; totalMigrated++; }
    if (Object.keys(updates).length) {
      await prisma.movie.update({ where: { id: m.id }, data: updates });
    }
  }

  console.log(`\n=== 迁移完成! 共处理 ${totalMigrated} 个字段 ===`);
  console.log('文件保存位置:', UPLOADS_DIR);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('迁移脚本执行失败:', err);
  prisma.$disconnect().then(() => process.exit(1));
});
