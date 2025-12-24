import { Request, Response } from 'express';
/**
 * 获取所有电影
 */
export declare const getMovies: (req: Request, res: Response) => Promise<void>;
/**
 * 创建电影
 */
export declare const createMovie: (req: Request, res: Response) => Promise<void>;
/**
 * 更新电影
 */
export declare const updateMovie: (req: Request, res: Response) => Promise<void>;
/**
 * 删除电影
 */
export declare const deleteMovie: (req: Request, res: Response) => Promise<void>;
/**
 * 更新电影排序
 */
export declare const updateMovieOrder: (req: Request, res: Response) => Promise<void>;
/**
 * 更新电影点赞数
 */
export declare const updateMovieLikes: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=movieController.d.ts.map