import { z } from 'zod';

// 用户创建验证模式
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be at most 50 characters long'),
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters long')
    .max(100, 'Title must be at most 100 characters long'),
  bio: z
    .string()
    .max(1000, 'Bio must be at most 1000 characters long'),
  email: z
    .string()
    .email('Email must be a valid email address')
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .regex(/^[0-9\-+().\s]+$/, 'Phone number is invalid')
    .optional()
    .default(''),
  location: z
    .string()
    .max(100, 'Location must be at most 100 characters long')
    .optional()
    .default(''),
  avatar: z
    .string()
    .url('Avatar must be a valid URL')
    .optional()
    .default(''),
});

// 用户更新验证模式
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be at most 50 characters long')
    .optional(),
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters long')
    .max(100, 'Title must be at most 100 characters long')
    .optional(),
  bio: z
    .string()
    .max(1000, 'Bio must be at most 1000 characters long')
    .optional(),
  phone: z
    .string()
    .regex(/^[0-9\-+().\s]+$/, 'Phone number is invalid')
    .optional(),
  location: z
    .string()
    .max(100, 'Location must be at most 100 characters long')
    .optional(),
  avatar: z
    .string()
    .url('Avatar must be a valid URL')
    .optional(),
});

// 用户ID验证模式
export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'User ID must be a number'),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
