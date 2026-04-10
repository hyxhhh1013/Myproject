import { Request } from 'express';

// 扩展 Express Request 类型，添加用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        [key: string]: any;
      };
      file?: Express.Multer.File;
    }
  }
}

// 自定义认证请求类型 - 用户可能存在也可能不存在
export type AuthRequest = Request & {
  user?: {
    id: number;
    email: string;
  };
};

// 自定义文件上传请求类型
export type FileUploadRequest = Request;

// 自定义 API 响应类型
export interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data?: T;
  error?: string | Record<string, any>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Prisma 查询选项类型
export type PrismaWhereInput = Record<string, any>;
export type PrismaOrderByInput = Record<string, any> | Record<string, any>[];
export type PrismaSelectInput = Record<string, boolean>;

// 数据库操作验证上下文
export interface ValidationContext {
  where?: PrismaWhereInput;
  orderBy?: PrismaOrderByInput;
  select?: PrismaSelectInput;
  include?: Record<string, any>;
}
