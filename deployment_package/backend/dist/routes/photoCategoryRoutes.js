"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const photoCategoryController_1 = require("../controllers/photoCategoryController");
const cache_1 = require("../middleware/cache");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// 获取所有分类 - 添加缓存（10分钟）
router.get('/', (0, cache_1.cacheMiddleware)(600), photoCategoryController_1.getAllCategories);
// 创建分类
router.post('/', authMiddleware_1.protect, async (req, res) => {
    await (0, photoCategoryController_1.createCategory)(req, res);
    // 清除分类相关缓存
    (0, cache_1.clearCache)('/api/photo-categories');
});
// 获取单个分类 - 添加缓存（15分钟）
router.get('/:id', (0, cache_1.cacheMiddleware)(900), photoCategoryController_1.getCategory);
// 更新分类
router.put('/:id', authMiddleware_1.protect, async (req, res) => {
    await (0, photoCategoryController_1.updateCategory)(req, res);
    // 清除分类相关缓存
    (0, cache_1.clearCache)('/api/photo-categories');
    (0, cache_1.clearCache)(`/api/photo-categories/${req.params.id}`);
});
// 删除分类
router.delete('/:id', authMiddleware_1.protect, async (req, res) => {
    await (0, photoCategoryController_1.deleteCategory)(req, res);
    // 清除分类相关缓存
    (0, cache_1.clearCache)('/api/photo-categories');
    (0, cache_1.clearCache)(`/api/photo-categories/${req.params.id}`);
});
exports.default = router;
//# sourceMappingURL=photoCategoryRoutes.js.map