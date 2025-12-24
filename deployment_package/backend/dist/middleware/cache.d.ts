import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
declare const cache: NodeCache;
/**
 * 缓存中间件
 * @param duration 缓存持续时间（秒）
 * @returns Express中间件
 */
export declare const cacheMiddleware: (duration: number) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * 清除特定缓存
 * @param key 缓存键或键的前缀
 */
export declare const clearCache: (key: string) => void;
/**
 * 清除所有缓存
 */
export declare const clearAllCache: () => void;
export { cache };
//# sourceMappingURL=cache.d.ts.map