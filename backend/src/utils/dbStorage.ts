import { prisma } from '../index';
import fs from 'fs/promises';
import path from 'path';

/**
 * 将文件从本地路径异步保存到数据库中
 */
export const saveFileToDb = async (filePath: string, filename: string) => {
  try {
    const data = await fs.readFile(filePath);
    const mimeType = getMimeType(filename);
    const size = data.length;

    // 使用 upsert 确保如果文件名已存在则更新，不存在则创建
    await prisma.uploadedFile.upsert({
      where: { filename },
      update: {
        mimeType,
        data,
        size,
      },
      create: {
        filename,
        mimeType,
        data,
        size,
      },
    });

    // 保存到数据库后异步删除本地文件
    await fs.unlink(filePath).catch(err => console.error(`Failed to delete local file ${filePath}:`, err));
  } catch (error) {
    console.error(`Error saving file ${filename} to DB:`, error);
  }
};

/**
 * 直接保存 Buffer 到数据库中
 */
export const saveBufferToDb = async (data: Buffer, filename: string) => {
  try {
    const mimeType = getMimeType(filename);
    const size = data.length;

    await prisma.uploadedFile.upsert({
      where: { filename },
      update: { mimeType, data, size },
      create: { filename, mimeType, data, size },
    });
  } catch (error) {
    console.error(`Error saving buffer ${filename} to DB:`, error);
  }
};

/**
 * 从数据库中获取文件数据
 */
export const getFileFromDb = async (filename: string) => {
  return await prisma.uploadedFile.findUnique({
    where: { filename },
  });
};

const getMimeType = (filename: string) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.pdf': return 'application/pdf';
    case '.zip': return 'application/zip';
    default: return 'application/octet-stream';
  }
};
