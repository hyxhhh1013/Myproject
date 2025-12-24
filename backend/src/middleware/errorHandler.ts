import { Request, Response, NextFunction } from 'express';

// 自定义错误类
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 全局错误处理中间件
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // 设置默认错误状态码和消息
  let error = { ...err };
  error.message = err.message;

  // 处理不同类型的错误
  if (err.name === 'CastError') {
    const message = `资源未找到，ID格式不正确: ${err.value}`;
    error = new AppError(message, 404);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  if (err.code === 11000) {
    const message = '重复的字段值，资源已存在';
    error = new AppError(message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    const message = '无效的Token，请重新登录';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token已过期，请重新登录';
    error = new AppError(message, 401);
  }

  // 记录错误日志
  console.error('ERROR:', {
    timestamp: new Date().toISOString(),
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: error.stack,
  });

  // 向客户端返回错误响应
  res.status(error.statusCode || 500).json({
    status: error.statusCode === 500 ? 'error' : 'fail',
    message: error.message || '服务器内部错误',
    // 只在开发环境中返回错误栈
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

// 未处理的路由处理
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`无法找到 ${req.originalUrl} 路径`, 404);
  next(error);
};
