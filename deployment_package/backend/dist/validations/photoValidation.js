"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPhotosSchema = exports.updatePhotosOrderSchema = exports.photoIdSchema = exports.bulkUploadPhotosSchema = exports.updatePhotoSchema = exports.createPhotoSchema = void 0;
const zod_1 = require("zod");
// 照片创建验证模式
exports.createPhotoSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().regex(/^\d+$/, { message: 'categoryId必须是数字' }),
    isFeatured: zod_1.z.union([zod_1.z.string().transform(val => val === 'true'), zod_1.z.boolean()]).optional().default(false),
    isVisible: zod_1.z.union([zod_1.z.string().transform(val => val === 'true'), zod_1.z.boolean()]).optional().default(true),
    orderIndex: zod_1.z.string().regex(/^\d+$/, { message: 'orderIndex必须是数字' }).optional().default('0'),
});
// 照片更新验证模式
exports.updatePhotoSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().optional(),
    thumbnailUrl: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().regex(/^\d+$/, { message: 'categoryId必须是数字' }).optional(),
    isFeatured: zod_1.z.union([zod_1.z.string().transform(val => val === 'true'), zod_1.z.boolean()]).optional(),
    isVisible: zod_1.z.union([zod_1.z.string().transform(val => val === 'true'), zod_1.z.boolean()]).optional(),
    orderIndex: zod_1.z.string().regex(/^\d+$/, { message: 'orderIndex必须是数字' }).optional(),
    takenAt: zod_1.z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: 'takenAt必须是有效的日期字符串' }),
    exifData: zod_1.z.any().optional(),
});
// 批量上传照片验证模式
exports.bulkUploadPhotosSchema = zod_1.z.object({
    categoryId: zod_1.z.string().regex(/^\d+$/, { message: 'categoryId必须是数字' }),
    isFeatured: zod_1.z.union([zod_1.z.string().transform(val => val === 'true'), zod_1.z.boolean()]).optional().default(false),
    isVisible: zod_1.z.union([zod_1.z.string().transform(val => val === 'true'), zod_1.z.boolean()]).optional().default(true),
});
// 照片ID验证模式
exports.photoIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, { message: 'ID必须是数字' }),
});
// 批量更新照片排序验证模式
exports.updatePhotosOrderSchema = zod_1.z.object({
    photos: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.number(),
        orderIndex: zod_1.z.number(),
    })),
});
// 获取照片列表验证模式
exports.getPhotosSchema = zod_1.z.object({
    categoryId: zod_1.z.string().regex(/^\d+$/, { message: 'categoryId必须是数字' }).optional(),
    isFeatured: zod_1.z.string().transform(val => val === 'true').optional(),
    page: zod_1.z.string().regex(/^\d+$/, { message: 'page必须是数字' }).optional().default('1'),
    limit: zod_1.z.string().regex(/^\d+$/, { message: 'limit必须是数字' }).optional().default('20'),
});
//# sourceMappingURL=photoValidation.js.map