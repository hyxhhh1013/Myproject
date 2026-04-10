import { z } from 'zod';

// 教育创建验证模式
export const createEducationSchema = z.object({
  school: z
    .string()
    .min(2, 'School name must be at least 2 characters long')
    .max(100, 'School name must be at most 100 characters long'),
  degree: z
    .string()
    .min(2, 'Degree must be at least 2 characters long')
    .max(50, 'Degree must be at most 50 characters long'),
  major: z
    .string()
    .min(2, 'Major must be at least 2 characters long')
    .max(100, 'Major must be at most 100 characters long'),
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

// 教育更新验证模式
export const updateEducationSchema = z.object({
  school: z
    .string()
    .min(2, 'School name must be at least 2 characters long')
    .max(100, 'School name must be at most 100 characters long')
    .optional(),
  degree: z
    .string()
    .min(2, 'Degree must be at least 2 characters long')
    .max(50, 'Degree must be at most 50 characters long')
    .optional(),
  major: z
    .string()
    .min(2, 'Major must be at least 2 characters long')
    .max(100, 'Major must be at most 100 characters long')
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

// 教育ID验证模式
export const educationIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Education ID must be a number'),
});

export type CreateEducationRequest = z.infer<typeof createEducationSchema>;
export type UpdateEducationRequest = z.infer<typeof updateEducationSchema>;
