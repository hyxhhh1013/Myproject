import { z } from 'zod';

// 工作经历创建验证模式
export const createExperienceSchema = z.object({
  company: z
    .string()
    .min(2, 'Company name must be at least 2 characters long')
    .max(100, 'Company name must be at most 100 characters long'),
  position: z
    .string()
    .min(2, 'Position must be at least 2 characters long')
    .max(100, 'Position must be at most 100 characters long'),
  startDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), 'Start date must be a valid date'),
  endDate: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'End date must be a valid date')
    .optional()
    .nullable(),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters long'),
});

// 工作经历更新验证模式
export const updateExperienceSchema = z.object({
  company: z
    .string()
    .min(2, 'Company name must be at least 2 characters long')
    .max(100, 'Company name must be at most 100 characters long')
    .optional(),
  position: z
    .string()
    .min(2, 'Position must be at least 2 characters long')
    .max(100, 'Position must be at most 100 characters long')
    .optional(),
  startDate: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Start date must be a valid date')
    .optional(),
  endDate: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'End date must be a valid date')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters long')
    .optional(),
});

// 工作经历ID验证模式
export const experienceIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Experience ID must be a number'),
});

export type CreateExperienceRequest = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceRequest = z.infer<typeof updateExperienceSchema>;
