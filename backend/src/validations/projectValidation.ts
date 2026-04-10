import { z } from 'zod';

// 项目创建验证模式
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title is required')
    .max(200, 'Title must be at most 200 characters long'),
  description: z
    .string()
    .min(1, 'Project description is required')
    .max(2000, 'Description must be at most 2000 characters long'),
  startDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), 'Start date must be a valid date'),
  endDate: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'End date must be a valid date')
    .optional()
    .nullable(),
  technologies: z
    .string()
    .min(1, 'Technologies field is required')
    .max(500, 'Technologies must be at most 500 characters long'),
  imageUrl: z
    .string()
    .url('Image URL must be a valid URL')
    .optional(),
  githubUrl: z
    .string()
    .url('GitHub URL must be a valid URL')
    .optional(),
  demoUrl: z
    .string()
    .url('Demo URL must be a valid URL')
    .optional(),
  orderIndex: z
    .union([z.number(), z.string().regex(/^\d+$/)]) 
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional()
    .default(0),
});

// 项目更新验证模式
export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title is required')
    .max(200, 'Title must be at most 200 characters long')
    .optional(),
  description: z
    .string()
    .min(1, 'Project description is required')
    .max(2000, 'Description must be at most 2000 characters long')
    .optional(),
  startDate: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Start date must be a valid date')
    .optional(),
  endDate: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'End date must be a valid date')
    .optional(),
  technologies: z
    .string()
    .min(1, 'Technologies field is required')
    .max(500, 'Technologies must be at most 500 characters long')
    .optional(),
  imageUrl: z
    .string()
    .url('Image URL must be a valid URL')
    .optional(),
  githubUrl: z
    .string()
    .url('GitHub URL must be a valid URL')
    .optional(),
  demoUrl: z
    .string()
    .url('Demo URL must be a valid URL')
    .optional(),
  orderIndex: z
    .union([z.number(), z.string().regex(/^\d+$/)]) 
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional(),
});

// 项目ID验证模式
export const projectIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Project ID must be a number'),
});

export type CreateProjectRequest = z.infer<typeof createProjectSchema>;
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;
