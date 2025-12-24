import { Router } from 'express';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
} from '../controllers/photoCategoryController';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// 获取所有分类 - 添加缓存（10分钟）
router.get('/', cacheMiddleware(600), getAllCategories);

// 创建分类
router.post('/', protect, async (req, res) => {
  await createCategory(req, res);
  // 清除分类相关缓存
  clearCache('/api/photo-categories');
});

// 获取单个分类 - 添加缓存（15分钟）
router.get('/:id', cacheMiddleware(900), getCategory);

// 更新分类
router.put('/:id', protect, async (req, res) => {
  await updateCategory(req, res);
  // 清除分类相关缓存
  clearCache('/api/photo-categories');
  clearCache(`/api/photo-categories/${req.params.id}`);
});

// 删除分类
router.delete('/:id', protect, async (req, res) => {
  await deleteCategory(req, res);
  // 清除分类相关缓存
  clearCache('/api/photo-categories');
  clearCache(`/api/photo-categories/${req.params.id}`);
});

export default router;
