import { z } from 'zod';

// 登录验证模式
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email must be a valid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
});

// 修改密码验证模式
export const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(6, 'Old password must be at least 6 characters long'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters long')
    .refine(val => !/^(\w)\1+$/.test(val), 'Password contains too many repeated characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
