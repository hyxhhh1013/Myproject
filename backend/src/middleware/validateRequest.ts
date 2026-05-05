import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './errorHandler';

/**
 * 请求参数验证中间件
 * @param schema Zod验证模式
 * @param type 要验证的参数类型（body, query, params）
 * @returns 中间件函数
 */
export const validateRequest = (schema: ZodSchema, type: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 验证请求参数
      const validatedData = schema.parse(req[type]);
      
      // 将验证后的数据赋值回请求对象
      // 注意：这可能会覆盖掉原本在 req[type] 中但未在 schema 中定义的字段！
      // 推荐使用扩展或部分覆盖，避免丢失未验证的数据，特别是如果后续逻辑需要它们
      req[type] = { ...req[type], ...validatedData };
      next();
    } catch (error: any) {
      // 处理验证错误
      const message = error.errors?.map((err: any) => err.message).join(', ') || 'Validation error';
      next(new AppError(message, 400));
    }
  };
};

/**
 * 多类型请求参数验证中间件
 * @param schemas 包含不同类型验证模式的对象
 * @returns 中间件函数
 */
export const validateRequests = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 验证不同类型的请求参数
      if (schemas.body) {
        const validatedBody = schemas.body.parse(req.body);
        req.body = { ...req.body, ...validatedBody };
      }
      
      if (schemas.query) {
        const validatedQuery = schemas.query.parse(req.query);
        req.query = { ...req.query, ...validatedQuery };
      }
      
      if (schemas.params) {
        const validatedParams = schemas.params.parse(req.params);
        req.params = { ...req.params, ...validatedParams };
      }
      
      next();
    } catch (error: any) {
      // 处理验证错误
      const message = error.errors?.map((err: any) => err.message).join(', ') || 'Validation error';
      next(new AppError(message, 400));
    }
  };
};
