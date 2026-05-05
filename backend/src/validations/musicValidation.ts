import { z } from 'zod';

// 音乐创建验证模式
export const createMusicSchema = z.object({
  title: z
    .string()
    .min(1, 'Music title is required')
    .max(200, 'Title must be at most 200 characters long'),
  artist: z
    .string()
    .max(100, 'Artist name must be at most 100 characters long')
    .optional(),
  coverUrl: z
    .string()
    .url('Cover URL must be a valid URL')
    .optional(),
  platform: z
    .enum(['netease', 'spotify', 'youtube', 'other'])
    .optional()
    .default('netease'),
  url: z
    .string()
    .url('Music URL must be a valid URL')
    .optional(),
  lyrics: z
    .string()
    .max(5000, 'Lyrics must be at most 5000 characters long')
    .optional(),
  orderIndex: z
    .union([z.number(), z.string().regex(/^\d+$/)])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional()
    .default(0),
  isVisible: z
    .union([z.string().transform(val => val === 'true'), z.boolean()])
    .optional()
    .default(true),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters long')
    .optional(),
  playlistId: z
    .string()
    .max(100, 'Playlist ID must be at most 100 characters long')
    .optional(),
  playlistType: z
    .enum(['album', 'playlist', 'single'])
    .optional(),
});

// 音乐更新验证模式
export const updateMusicSchema = z.object({
  title: z
    .string()
    .min(1, 'Music title is required')
    .max(200, 'Title must be at most 200 characters long')
    .optional(),
  artist: z
    .string()
    .max(100, 'Artist name must be at most 100 characters long')
    .optional(),
  coverUrl: z
    .string()
    .url('Cover URL must be a valid URL')
    .optional(),
  platform: z
    .enum(['netease', 'spotify', 'youtube', 'other'])
    .optional(),
  url: z
    .string()
    .url('Music URL must be a valid URL')
    .optional(),
  lyrics: z
    .string()
    .max(5000, 'Lyrics must be at most 5000 characters long')
    .optional(),
  orderIndex: z
    .union([z.number(), z.string().regex(/^\d+$/)])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional(),
  isVisible: z
    .union([z.string().transform(val => val === 'true'), z.boolean()])
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters long')
    .optional(),
  playlistId: z
    .string()
    .max(100, 'Playlist ID must be at most 100 characters long')
    .optional(),
  playlistType: z
    .enum(['album', 'playlist', 'single'])
    .optional(),
});

// 音乐ID验证模式
export const musicIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Music ID must be a number'),
});

export type CreateMusicRequest = z.infer<typeof createMusicSchema>;
export type UpdateMusicRequest = z.infer<typeof updateMusicSchema>;
