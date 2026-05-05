import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import sharp from 'sharp';

const prisma = new PrismaClient();

async function getPlaceholderBase64(seed: string): Promise<string> {
  try {
    const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const optimized = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    return `data:image/webp;base64,${optimized.toString('base64')}`;
  } catch (error) {
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // transparent pixel fallback
  }
}

async function fixProjects() {
  const items = await prisma.project.findMany({
    where: { 
      OR: [
        { imageUrl: { startsWith: '/uploads' } },
        { imageUrl: { startsWith: 'http://localhost' } },
        { imageUrl: null }
      ]
    }
  });

  console.log(`Fixing ${items.length} projects...`);
  for (const item of items) {
    const b64 = await getPlaceholderBase64(`project-${item.id}`);
    await prisma.project.update({
      where: { id: item.id },
      data: { imageUrl: b64 }
    });
  }
}

async function fixPhotos() {
  const items = await prisma.photo.findMany({
    where: { 
      OR: [
        { imageUrl: { startsWith: '/uploads' } },
        { imageUrl: { contains: 'localhost' } }
      ]
    }
  });

  console.log(`Fixing ${items.length} photos...`);
  for (const item of items) {
    const b64 = await getPlaceholderBase64(`photo-${item.id}`);
    const thumb = await getPlaceholderBase64(`photo-thumb-${item.id}`);
    await prisma.photo.update({
      where: { id: item.id },
      data: { imageUrl: b64, thumbnailUrl: thumb }
    });
  }
}

async function fixMusic() {
  const items = await prisma.music.findMany({
    where: { 
      OR: [
        { coverUrl: { startsWith: '/uploads' } },
        { coverUrl: null }
      ]
    }
  });

  console.log(`Fixing ${items.length} music covers...`);
  for (const item of items) {
    const b64 = await getPlaceholderBase64(`music-${item.id}`);
    await prisma.music.update({
      where: { id: item.id },
      data: { coverUrl: b64 }
    });
  }
}

async function fixMovies() {
  const items = await prisma.movie.findMany({
    where: { 
      OR: [
        { poster: { startsWith: '/uploads' } },
        { poster: null }
      ]
    }
  });

  console.log(`Fixing ${items.length} movies...`);
  for (const item of items) {
    const b64 = await getPlaceholderBase64(`movie-${item.id}`);
    await prisma.movie.update({
      where: { id: item.id },
      data: { poster: b64 }
    });
  }
}

async function main() {
  await fixProjects();
  await fixPhotos();
  await fixMusic();
  await fixMovies();
  console.log('Migration finished!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
