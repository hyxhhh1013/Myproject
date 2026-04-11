import { Request, Response } from 'express';
import { getFileFromDb, saveBufferToDb } from '../utils/dbStorage';
import { generateThumbnailBuffer, optimizeImageBuffer } from '../utils/imageOptimizer';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger';

/**
 * 从数据库服务图片
 */
export const serveFileFromDb = async (req: Request, res: Response) => {
  const { filename } = req.params;
  try {
    const file = await getFileFromDb(filename);
    if (!file) {
      // 如果数据库没找到，尝试在本地磁盘找（兼容旧数据）
      const localPath = path.join(__dirname, '../../uploads', filename);
      const fsSync = require('fs');
      if (fsSync.existsSync(localPath)) {
        return res.sendFile(localPath);
      }
      return res.status(404).send('File not found');
    }
    
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    res.send(file.data);
  } catch (error) {
    logger.error(`Error serving file ${filename} from DB:`, error);
    res.status(500).send('Internal Server Error');
  }
};

/**
 * 处理上传并保存到数据库
 */
export const handleUploadToDb = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }
    
    // 1. 并行生成缩略图和优化原图 (内存处理)
    const [thumbRes, optRes] = await Promise.all([
      generateThumbnailBuffer(req.file.path),
      optimizeImageBuffer(req.file.path)
    ]);
    
    const baseFilename = path.basename(req.file.path, path.extname(req.file.path));
    const thumbnailFilename = `${baseFilename}-thumb.webp`;
    const optimizedFilename = `${baseFilename}-opt.webp`;
    
    // 2. 并行保存到数据库
    await Promise.all([
      saveBufferToDb(optRes.buffer, optimizedFilename),
      saveBufferToDb(thumbRes.buffer, thumbnailFilename)
    ]);
    
    // 3. 清理本地临时文件
    await fs.unlink(req.file.path).catch(() => {});

    const imageUrl = `/uploads/${optimizedFilename}`;
    const thumbnailUrl = `/uploads/${thumbnailFilename}`;
    
    res.json({ url: imageUrl, thumbnailUrl });
  } catch (error) {
    logger.error('Upload to DB error:', error);
    res.status(500).json({ error: '上传失败' });
  }
};

/**
 * 处理多文件上传并保存到数据库
 */
export const handleMultipleUploadToDb = async (req: any, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: '请上传图片' });
    }
    
    const results = await Promise.all(
      req.files.map(async (file: any) => {
        // 1. 并行处理
        const [thumbRes, optRes] = await Promise.all([
          generateThumbnailBuffer(file.path),
          optimizeImageBuffer(file.path)
        ]);
        
        const baseFilename = path.basename(file.path, path.extname(file.path));
        const thumbnailFilename = `${baseFilename}-thumb.webp`;
        const optimizedFilename = `${baseFilename}-opt.webp`;
        
        // 2. 保存
        await Promise.all([
          saveBufferToDb(optRes.buffer, optimizedFilename),
          saveBufferToDb(thumbRes.buffer, thumbnailFilename)
        ]);
        
        // 3. 清理
        await fs.unlink(file.path).catch(() => {});
        
        return {
          url: `/uploads/${optimizedFilename}`,
          thumbnailUrl: `/uploads/${thumbnailFilename}`
        };
      })
    );
    
    const urls = results.map(r => r.url);
    const thumbnailUrls = results.map(r => r.thumbnailUrl);
    
    res.json({ urls, thumbnailUrls });
  } catch (error) {
    logger.error('Multiple upload to DB error:', error);
    res.status(500).json({ error: '上传多张图片失败' });
  }
};
