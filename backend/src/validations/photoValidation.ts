import { z } from 'zod';

// 照片创建验证模式
export const createPhotoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().regex(/^\d+$/, { message: 'categoryId必须是数字' }),
  isFeatured: z.union([z.string().transform(val => val === 'true'), z.boolean()]).optional().default(false),
  isVisible: z.union([z.string().transform(val => val === 'true'), z.boolean()]).optional().default(true),
  orderIndex: z.string().regex(/^\d+$/, { message: 'orderIndex必须是数字' }).optional().default('0'),
});

// 照片更新验证模式
export const updatePhotoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  categoryId: z.string().regex(/^\d+$/, { message: 'categoryId必须是数字' }).optional(),
  isFeatured: z.union([z.string().transform(val => val === 'true'), z.boolean()]).optional(),
  isVisible: z.union([z.string().transform(val => val === 'true'), z.boolean()]).optional(),
  orderIndex: z.string().regex(/^\d+$/, { message: 'orderIndex必须是数字' }).optional(),
  takenAt: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: 'takenAt必须是有效的日期字符串' }),
  exifData: z.any().optional(),
});

// 批量上传照片验证模式
export const bulkUploadPhotosSchema = z.object({
  categoryId: z.string().regex(/^\d+$/, { message: 'categoryId必须是数字' }),
  isFeatured: z.union([z.string().transform(val => val === 'true'), z.boolean()]).optional().default(false),
  isVisible: z.union([z.string().transform(val => val === 'true'), z.boolean()]).optional().default(true),
});

// 照片ID验证模式
export const photoIdSchema = z.object({
  id: z.string().regex(/^\d+$/, { message: 'ID必须是数字' }),
});

// 批量更新照片排序验证模式
export const updatePhotosOrderSchema = z.object({
  photos: z.array(
    z.object({
      id: z.number(),
      orderIndex: z.number(),
    })
  ),
});

// 获取照片列表验证模式
export const getPhotosSchema = z.object({
  categoryId: z.string().regex(/^\d+$/, { message: 'categoryId必须是数字' }).optional(),
  isFeatured: z.string().transform(val => val === 'true').optional(),
  page: z.string().regex(/^\d+$/, { message: 'page必须是数字' }).optional().default('1'),
  limit: z.string().regex(/^\d+$/, { message: 'limit必须是数字' }).optional().default('20'),
});
