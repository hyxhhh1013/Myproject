import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * 请求参数验证中间件
 * @param schema Zod验证模式
 * @param type 要验证的参数类型（body, query, params）
 * @returns 中间件函数
 */
export declare const validateRequest: (schema: ZodSchema, type?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => void;
/**
 * 多类型请求参数验证中间件
 * @param schemas 包含不同类型验证模式的对象
 * @returns 中间件函数
 */
export declare const validateRequests: (schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validateRequest.d.ts.map