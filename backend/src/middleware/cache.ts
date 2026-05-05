import { Request, Response, NextFunction } from 'express';
import { cache } from '../utils/cache';

/**
 * 缓存中间件
 * @param duration 缓存持续时间（秒）
 * @returns Express中间件
 */
export const cacheMiddleware = (duration: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${req.originalUrl}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    const originalJson = res.json;
    res.json = function (body) {
      if (this.statusCode === 200) {
        cache.set(cacheKey, body, duration);
        this.setHeader('X-Cache', 'MISS');
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * 清除特定缓存
 * @param key 缓存键或键的前缀
 */
export const clearCache = (key: string) => {
  if (cache.has(key)) {
    cache.del(key);
  } else {
    const keys = cache.keys();
    keys.forEach((cacheKey) => {
      if (cacheKey.startsWith(key)) {
        cache.del(cacheKey);
      }
    });
  }
};

/**
 * 清除所有缓存
 */
export const clearAllCache = () => {
  cache.flushAll();
};

export { cache };