import { Router } from 'express';
import { upload, generateThumbnail } from '../controllers/photoController';
import { protect } from '../middleware/authMiddleware';
import path from 'path';

const router = Router();

router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }
    
    // 生成缩略图
    const thumbnailPath = await generateThumbnail(req.file.path);
    const imageUrl = `/uploads/${req.file.filename}`;
    const thumbnailUrl = `/uploads/${path.basename(thumbnailPath)}`;
    
    res.json({ url: imageUrl, thumbnailUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '上传失败' });
  }
});

router.post('/upload/multiple', protect, upload.array('images', 9), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: '请上传图片' });
    }
    
    const results = await Promise.all(
      req.files.map(async (file: any) => {
        // 生成缩略图
        const thumbnailPath = await generateThumbnail(file.path);
        return {
          url: `/uploads/${file.filename}`,
          thumbnailUrl: `/uploads/${path.basename(thumbnailPath)}`
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
