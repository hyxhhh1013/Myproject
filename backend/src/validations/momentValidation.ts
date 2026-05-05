import { z } from 'zod';

export const createMomentSchema = z.object({
  content: z.string().min(1, '内容不能为空'),
  images: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  isVisible: z.boolean().optional(),
});

export const updateMomentSchema = z.object({
  content: z.string().min(1, '内容不能为空').optional(),
  images: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  isVisible: z.boolean().optional(),
  likes: z.number().int().optional(),
});

