import { Router } from 'express';
import { upload } from '../controllers/photoController';
import { protect } from '../middleware/authMiddleware';
import { generateThumbnail, optimizeImage } from '../utils/imageUtils';

const router = Router();

router.post('/upload', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }
    
    // 生成缩略图与优化图 (存储在数据库中)
    const imageUrl = await optimizeImage(req.file.buffer);
    const thumbnailUrl = await generateThumbnail(req.file.buffer);
    
    res.json({ url: imageUrl, thumbnailUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '上传失败' });
  }
});

router.post('/upload/multiple', protect, upload.array('images', 9), async (req, res, next) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: '请上传图片' });
    }
    
    const results = await Promise.all(
      req.files.map(async (file: Express.Multer.File) => {
        const imageUrl = await optimizeImage(file.buffer);
        const thumbnailUrl = await generateThumbnail(file.buffer);
        return {
          url: imageUrl,
          thumbnailUrl: thumbnailUrl
        };
      })
    );
    
    const urls = results.map(r => r.url);
    const thumbnailUrls = results.map(r => r.thumbnailUrl);
    
    res.json({ urls, thumbnailUrls });
  } catch (error) {
    console.error('Upload multiple error:', error);
    res.status(500).json({ error: '上传多张图片失败' });
  }
});

export default router;
