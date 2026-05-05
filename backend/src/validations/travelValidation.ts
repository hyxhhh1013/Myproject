import { z } from 'zod';

// 旅行城市创建验证模式
export const createTravelCitySchema = z.object({
  name: z
    .string()
    .min(1, 'City name is required')
    .max(100, 'Name must be at most 100 characters long'),
  location: z
    .string()
    .max(200, 'Location must be at most 200 characters long')
    .optional(),
  latitude: z
    .union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .optional(),
  longitude: z
    .union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .optional(),
  visitedAt: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Visited date must be a valid date')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters long')
    .optional(),
  photos: z
    .string()
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
  note: z
    .string()
    .max(500, 'Note must be at most 500 characters long')
    .optional(),
});

// 旅行城市更新验证模式
export const updateTravelCitySchema = z.object({
  name: z
    .string()
    .min(1, 'City name is required')
    .max(100, 'Name must be at most 100 characters long')
    .optional(),
  location: z
    .string()
    .max(200, 'Location must be at most 200 characters long')
    .optional(),
  latitude: z
    .union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .optional(),
  longitude: z
    .union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .optional(),
  visitedAt: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Visited date must be a valid date')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters long')
    .optional(),
  photos: z
    .string()
    .optional(),
  orderIndex: z
    .union([z.number(), z.string().regex(/^\d+$/)])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .optional(),
  isVisible: z
    .union([z.string().transform(val => val === 'true'), z.boolean()])
    .optional(),
  note: z
    .string()
    .max(500, 'Note must be at most 500 characters long')
    .optional(),
});

// 旅行足迹创建验证模式
export const createTravelFootprintSchema = z.object({
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be at most 200 characters long'),
  latitude: z
    .union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val),
  longitude: z
    .union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val),
  visitedAt: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Visited date must be a valid date')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters long')
    .optional(),
  photos: z
    .string()
    .optional(),
});

// 旅行足迹更新验证模式
export const updateTravelFootprintSchema = z.object({
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be at most 200 characters long')
    .optional(),
  latitude: z
    .union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .optional(),
  longitude: z
    .union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)])
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .optional(),
  visitedAt: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Visited date must be a valid date')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters long')
    .optional(),
  photos: z
    .string()
    .optional(),
});

// 旅行城市ID验证模式
export const travelCityIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Travel city ID must be a number'),
});

// 旅行足迹ID验证模式
export const travelFootprintIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Travel footprint ID must be a number'),
});

export type CreateTravelCityRequest = z.infer<typeof createTravelCitySchema>;
export type UpdateTravelCityRequest = z.infer<typeof updateTravelCitySchema>;
export type CreateTravelFootprintRequest = z.infer<typeof createTravelFootprintSchema>;
export type UpdateTravelFootprintRequest = z.infer<typeof updateTravelFootprintSchema>;
