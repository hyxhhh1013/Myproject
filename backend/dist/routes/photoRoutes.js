"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const photoController_1 = require("../controllers/photoController");
const validateRequest_1 = require("../middleware/validateRequest");
const cache_1 = require("../middleware/cache");
const authMiddleware_1 = require("../middleware/authMiddleware");
const photoValidation_1 = require("../validations/photoValidation");
const router = (0, express_1.Router)();
// 获取所有作品 - 添加缓存（5分钟）
router.get('/', (0, cache_1.cacheMiddleware)(300), (0, validateRequest_1.validateRequest)(photoValidation_1.getPhotosSchema, 'query'), photoController_1.getAllPhotos);
// 批量删除作品
router.post('/bulk-delete', authMiddleware_1.protect, async (req, res) => {
    await (0, photoController_1.batchDeletePhotos)(req, res);
    // 清除照片相关缓存
    (0, cache_1.clearCache)('/api/photos');
});
// 批量分类作品
router.post('/batch/category', authMiddleware_1.protect, async (req, res) => {
    await (0, photoController_1.batchUpdateCategory)(req, res);
    // 清除照片相关缓存
    (0, cache_1.clearCache)('/api/photos');
});
// 创建作品 - 单张上传
router.post('/', authMiddleware_1.protect, photoController_1.upload.single('image'), (0, validateRequest_1.validateRequest)(photoValidation_1.createPhotoSchema, 'body'), async (req, res) => {
    await (0, photoController_1.createPhoto)(req, res);
    // 清除照片相关缓存
    (0, cache_1.clearCache)('/api/photos');
});
// 批量上传作品
router.post('/bulk', authMiddleware_1.protect, photoController_1.upload.array('images', 10), (0, validateRequest_1.validateRequest)(photoValidation_1.bulkUploadPhotosSchema, 'body'), async (req, res) => {
    await (0, photoController_1.bulkUploadPhotos)(req, res);
    // 清除照片相关缓存
    (0, cache_1.clearCache)('/api/photos');
});
// 获取单个作品 - 添加缓存（10分钟）
router.get('/:id', (0, cache_1.cacheMiddleware)(600), (0, validateRequest_1.validateRequest)(photoValidation_1.photoIdSchema, 'params'), photoController_1.getPhoto);
// 更新作品
router.put('/:id', authMiddleware_1.protect, (0, validateRequest_1.validateRequests)({ params: photoValidation_1.photoIdSchema, body: photoValidation_1.updatePhotoSchema }), async (req, res) => {
    await (0, photoController_1.updatePhoto)(req, res);
    // 清除照片相关缓存
    (0, cache_1.clearCache)('/api/photos');
    (0, cache_1.clearCache)(`/api/photos/${req.params.id}`);
});
// 删除作品
router.delete('/:id', authMiddleware_1.protect, (0, validateRequest_1.validateRequest)(photoValidation_1.photoIdSchema, 'params'), async (req, res) => {
    await (0, photoController_1.deletePhoto)(req, res);
    // 清除照片相关缓存
    (0, cache_1.clearCache)('/api/photos');
    (0, cache_1.clearCache)(`/api/photos/${req.params.id}`);
});
// 批量更新作品排序
router.put('/order/update', authMiddleware_1.protect, (0, validateRequest_1.validateRequest)(photoValidation_1.updatePhotosOrderSchema, 'body'), async (req, res) => {
    await (0, photoController_1.updatePhotosOrder)(req, res);
    // 清除照片相关缓存
    (0, cache_1.clearCache)('/api/photos');
});
exports.default = router;
//# sourceMappingURL=photoRoutes.js.map