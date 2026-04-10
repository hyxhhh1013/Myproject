import { z } from 'zod';

// 网站配置更新验证模式
export const updateSiteConfigSchema = z.object({
  siteTitle: z
    .string()
    .min(1, 'Site title is required')
    .max(200, 'Title must be at most 200 characters long')
    .optional(),
  seoKeywords: z
    .string()
    .max(500, 'SEO keywords must be at most 500 characters long')
    .optional(),
  seoDescription: z
    .string()
    .max(1000, 'SEO description must be at most 1000 characters long')
    .optional(),
  icpCode: z
    .string()
    .max(50, 'ICP code must be at most 50 characters long')
    .optional(),
});

// 网站配置查询参数验证模式
export const siteConfigIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Site config ID must be a number'),
});

// 访问统计更新验证模式
export const updateVisitorStatSchema = z.object({
  count: z
    .union([z.number(), z.string().regex(/^\d+$/)])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional(),
});

export type UpdateSiteConfigRequest = z.infer<typeof updateSiteConfigSchema>;
export type UpdateVisitorStatRequest = z.infer<typeof updateVisitorStatSchema>;
