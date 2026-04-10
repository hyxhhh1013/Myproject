import { z } from 'zod';

// 电影创建验证模式
export const createMovieSchema = z.object({
  title: z
    .string()
    .min(1, 'Movie title is required')
    .max(200, 'Title must be at most 200 characters long'),
  director: z
    .string()
    .max(100, 'Director name must be at most 100 characters long')
    .optional(),
  year: z
    .union([z.number(), z.string().regex(/^\d{4}$/)])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional(),
  posterUrl: z
    .string()
    .url('Poster URL must be a valid URL')
    .optional(),
  poster: z
    .string()
    .optional(),
  isVisible: z
    .union([z.string().transform(val => val === 'true'), z.boolean()])
    .optional()
    .default(true),
  orderIndex: z
    .union([z.number(), z.string().regex(/^\d+$/)])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional()
    .default(0),
  likes: z
    .union([z.number(), z.string().regex(/^\d+$/)])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional()
    .default(0),
  rating: z
    .union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .optional(),
  review: z
    .string()
    .max(2000, 'Review must be at most 2000 characters long')
    .optional(),
  watchedAt: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Watched date must be a valid date')
    .optional(),
});

// 电影更新验证模式
export const updateMovieSchema = z.object({
  title: z
    .string()
    .min(1, 'Movie title is required')
    .max(200, 'Title must be at most 200 characters long')
    .optional(),
  director: z
    .string()
    .max(100, 'Director name must be at most 100 characters long')
    .optional(),
  year: z
    .union([z.number(), z.string().regex(/^\d{4}$/)])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional(),
  posterUrl: z
    .string()
    .url('Poster URL must be a valid URL')
    .optional(),
  poster: z
    .string()
    .optional(),
  isVisible: z
    .union([z.string().transform(val => val === 'true'), z.boolean()])
    .optional(),
  orderIndex: z
    .union([z.number(), z.string().regex(/^\d+$/)])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional(),
  likes: z
    .union([z.number(), z.string().regex(/^\d+$/)])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional(),
  rating: z
    .union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .optional(),
  review: z
    .string()
    .max(2000, 'Review must be at most 2000 characters long')
    .optional(),
  watchedAt: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Watched date must be a valid date')
    .optional(),
});

// 电影ID验证模式
export const movieIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Movie ID must be a number'),
});

export type CreateMovieRequest = z.infer<typeof createMovieSchema>;
export type UpdateMovieRequest = z.infer<typeof updateMovieSchema>;
