import { z } from 'zod';

// 照片分类创建验证模式
export const createPhotoCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Name must be at most 100 characters long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be at most 100 characters long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters long')
    .optional(),
});

// 照片分类更新验证模式
export const updatePhotoCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Name must be at most 100 characters long')
    .optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be at most 100 characters long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters long')
    .optional(),
});

// 照片分类ID验证模式
export const photoCategoryIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Category ID must be a number'),
});

export type CreatePhotoCategoryRequest = z.infer<typeof createPhotoCategorySchema>;
export type UpdatePhotoCategoryRequest = z.infer<typeof updatePhotoCategorySchema>;
