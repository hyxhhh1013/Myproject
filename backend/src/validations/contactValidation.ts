import { z } from 'zod';

// 联系方式创建验证模式
export const createContactSchema = z.object({
  type: z
    .string()
    .min(1, 'Contact type is required')
    .max(50, 'Type must be at most 50 characters long'),
  value: z
    .string()
    .min(1, 'Contact value is required')
    .max(200, 'Value must be at most 200 characters long'),
});

// 联系方式更新验证模式
export const updateContactSchema = z.object({
  type: z
    .string()
    .min(1, 'Contact type is required')
    .max(50, 'Type must be at most 50 characters long')
    .optional(),
  value: z
    .string()
    .min(1, 'Contact value is required')
    .max(200, 'Value must be at most 200 characters long')
    .optional(),
});

// 联系方式ID验证模式
export const contactIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Contact ID must be a number'),
});

export type CreateContactRequest = z.infer<typeof createContactSchema>;
export type UpdateContactRequest = z.infer<typeof updateContactSchema>;
