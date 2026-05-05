import { z } from 'zod';

// 留言创建验证模式
export const createMessageSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters long'),
  email: z
    .string()
    .email('Email must be a valid email address')
    .trim()
    .toLowerCase(),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be at most 200 characters long'),
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(3000, 'Message must be at most 3000 characters long'),
});

// 批量标记为已读验证模式
export const batchMarkAsReadSchema = z.object({
  ids: z
    .array(z.number())
    .min(1, 'At least one ID is required'),
});

// 批量删除留言验证模式
export const batchDeleteMessagesSchema = z.object({
  ids: z
    .array(z.number())
    .min(1, 'At least one ID is required'),
});

// 留言查询参数验证模式
export const messageQuerySchema = z.object({
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
  isRead: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  search: z
    .string()
    .max(100, 'Search term must be at most 100 characters long')
    .optional(),
  sort: z
    .enum(['created_asc', 'created_desc'])
    .optional(),
});

// 留言ID验证模式
export const messageIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Message ID must be a number'),
});

// 标记为已读验证模式
export const markAsReadSchema = z.object({
  isRead: z.boolean().optional(),
});

export type CreateMessageRequest = z.infer<typeof createMessageSchema>;
export type BatchMarkAsReadRequest = z.infer<typeof batchMarkAsReadSchema>;
export type BatchDeleteMessagesRequest = z.infer<typeof batchDeleteMessagesSchema>;
export type MessageQueryParams = z.infer<typeof messageQuerySchema>;
export type MarkAsReadRequest = z.infer<typeof markAsReadSchema>;
