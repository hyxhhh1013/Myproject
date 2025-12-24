import { Router } from 'express';
import {
  getAllPhotos,
  createPhoto,
  updatePhoto,
  deletePhoto,
  getPhoto,
  updatePhotosOrder,
  bulkUploadPhotos,
  upload,
  batchDeletePhotos,
  batchUpdateCategory,
} from '../controllers/photoController';
import { validateRequest, validateRequests } from '../middleware/validateRequest';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import { protect } from '../middleware/authMiddleware';
import {
  createPhotoSchema,
  updatePhotoSchema,
  bulkUploadPhotosSchema,
  photoIdSchema,
  updatePhotosOrderSchema,
  getPhotosSchema
} from '../validations/photoValidation';

const router = Router();

// 获取所有作品 - 添加缓存（5分钟）
router.get('/', cacheMiddleware(300), validateRequest(getPhotosSchema, 'query'), getAllPhotos);

// 批量删除作品
router.post('/bulk-delete', protect, async (req, res) => {
  await batchDeletePhotos(req, res);
  // 清除照片相关缓存
  clearCache('/api/photos');
});

// 批量分类作品
router.post('/batch/category', protect, async (req, res) => {
  await batchUpdateCategory(req, res);
  // 清除照片相关缓存
  clearCache('/api/photos');
});

// 创建作品 - 单张上传
router.post('/', protect, upload.single('image'), validateRequest(createPhotoSchema, 'body'), async (req, res) => {
  await createPhoto(req, res);
  // 清除照片相关缓存
  clearCache('/api/photos');
});

// 批量上传作品
router.post('/bulk', protect, upload.array('images', 10), validateRequest(bulkUploadPhotosSchema, 'body'), async (req, res) => {
  await bulkUploadPhotos(req, res);
  // 清除照片相关缓存
  clearCache('/api/photos');
});

// 获取单个作品 - 添加缓存（10分钟）
router.get('/:id', cacheMiddleware(600), validateRequest(photoIdSchema, 'params'), getPhoto);

// 更新作品
router.put('/:id', protect, validateRequests({ params: photoIdSchema, body: updatePhotoSchema }), async (req, res) => {
  await updatePhoto(req, res);
  // 清除照片相关缓存
  clearCache('/api/photos');
  clearCache(`/api/photos/${req.params.id}`);
});

// 删除作品
router.delete('/:id', protect, validateRequest(photoIdSchema, 'params'), async (req, res) => {
  await deletePhoto(req, res);
  // 清除照片相关缓存
  clearCache('/api/photos');
  clearCache(`/api/photos/${req.params.id}`);
});

// 批量更新作品排序
router.put('/order/update', protect, validateRequest(updatePhotosOrderSchema, 'body'), async (req, res) => {
  await updatePhotosOrder(req, res);
  // 清除照片相关缓存
  clearCache('/api/photos');
});

export default router;
