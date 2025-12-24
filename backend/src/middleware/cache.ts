import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// 创建缓存实例，设置默认过期时间为10分钟
const cache = new NodeCache({
  stdTTL: 600, // 10分钟
  checkperiod: 120, // 每2分钟检查一次过期键
  useClones: false, // 不使用克隆，提高性能
});

/**
 * 缓存中间件
 * @param duration 缓存持续时间（秒）
 * @returns Express中间件
 */
export const cacheMiddleware = (duration: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next();
    }

    // 生成缓存键，基于请求URL和查询参数
    const cacheKey = `${req.originalUrl}`;

    // 尝试从缓存中获取数据
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      // 如果缓存存在，直接返回缓存数据
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // 如果缓存不存在，重写res.json方法，将响应数据存入缓存
    const originalJson = res.json;
    res.json = function (body) {
      // 只有在状态码为200时才缓存数据
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
    // 如果提供的是前缀，删除所有匹配的键
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

// 导出缓存实例，以便在其他地方使用
export { cache };
