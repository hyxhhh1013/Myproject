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
      req[type] = validatedData;
      next();
    } catch (error: any) {
      // 处理验证错误
      const message = error.errors.map((err: any) => err.message).join(', ');
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
        req.body = schemas.body.parse(req.body);
      }
      
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      
      next();
    } catch (error: any) {
      // 处理验证错误
      const message = error.errors.map((err: any) => err.message).join(', ');
      next(new AppError(message, 400));
    }
  };
};
