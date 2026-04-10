import { z } from 'zod';

export const createDanmakuSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(200, 'Content must be at most 200 characters long'),
  color: z
    .enum(['blue', 'gray', 'darkblue', 'slate', 'primary'], {
      errorMap: () => ({ message: 'Invalid color value' })
    })
    .optional()
    .default('blue'),
});

export const updateDanmakuSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(200, 'Content must be at most 200 characters long')
    .optional(),
  color: z
    .enum(['blue', 'gray', 'darkblue', 'slate', 'primary'], {
      errorMap: () => ({ message: 'Invalid color value' })
    })
    .optional(),
  isVisible: z.boolean().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export const danmakuQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a number')
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .optional()
    .default('20'),
  isVisible: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  search: z
    .string()
    .max(100, 'Search term must be at most 100 characters long')
    .optional(),
  sort: z
    .enum(['created_asc', 'created_desc', 'order_asc', 'order_desc'])
    .optional(),
});

export const danmakuIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Danmaku ID must be a number'),
});

export const batchDeleteDanmakuSchema = z.object({
  ids: z
    .array(z.number())
    .min(1, 'At least one ID is required'),
});

export const batchUpdateVisibilitySchema = z.object({
  ids: z
    .array(z.number())
    .min(1, 'At least one ID is required'),
  isVisible: z.boolean(),
});

export type CreateDanmakuRequest = z.infer<typeof createDanmakuSchema>;
export type UpdateDanmakuRequest = z.infer<typeof updateDanmakuSchema>;
export type DanmakuQueryParams = z.infer<typeof danmakuQuerySchema>;
export type BatchDeleteDanmakuRequest = z.infer<typeof batchDeleteDanmakuSchema>;
export type BatchUpdateVisibilityRequest = z.infer<typeof batchUpdateVisibilitySchema>;
