import { z } from 'zod';

// 技能创建验证模式
export const createSkillSchema = z.object({
  name: z
    .string()
    .min(1, 'Skill name is required')
    .max(100, 'Skill name must be at most 100 characters long'),
  level: z
    .union([
      z.number().min(1).max(5),
      z.string().regex(/^[1-5]$/, 'Level must be between 1 and 5'),
    ])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional()
    .default(1),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be at most 50 characters long'),
});

// 技能更新验证模式
export const updateSkillSchema = z.object({
  name: z
    .string()
    .min(1, 'Skill name is required')
    .max(100, 'Skill name must be at most 100 characters long')
    .optional(),
  level: z
    .union([
      z.number().min(1).max(5),
      z.string().regex(/^[1-5]$/, 'Level must be between 1 and 5'),
    ])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be at most 50 characters long')
    .optional(),
});

// 技能ID验证模式
export const skillIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Skill ID must be a number'),
});

export type CreateSkillRequest = z.infer<typeof createSkillSchema>;
export type UpdateSkillRequest = z.infer<typeof updateSkillSchema>;
