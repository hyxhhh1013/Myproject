import { z } from 'zod';

// 社交媒体创建验证模式
export const createSocialMediaSchema = z.object({
  platform: z
    .string()
    .min(1, 'Platform name is required')
    .max(50, 'Platform name must be at most 50 characters long'),
  url: z
    .string()
    .url('URL must be a valid URL'),
});

// 社交媒体更新验证模式
export const updateSocialMediaSchema = z.object({
  platform: z
    .string()
    .min(1, 'Platform name is required')
    .max(50, 'Platform name must be at most 50 characters long')
    .optional(),
  url: z
    .string()
    .url('URL must be a valid URL')
    .optional(),
});

// 社交媒体ID验证模式
export const socialMediaIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Social media ID must be a number'),
});

export type CreateSocialMediaRequest = z.infer<typeof createSocialMediaSchema>;
export type UpdateSocialMediaRequest = z.infer<typeof updateSocialMediaSchema>;
