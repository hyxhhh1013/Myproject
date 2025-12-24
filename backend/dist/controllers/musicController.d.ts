import { Request, Response } from 'express';
/**
 * 获取所有音乐配置
 */
export declare const getMusic: (req: Request, res: Response) => Promise<void>;
/**
 * 创建音乐配置
 */
export declare const createMusic: (req: Request, res: Response) => Promise<void>;
/**
 * 更新音乐配置
 */
export declare const updateMusic: (req: Request, res: Response) => Promise<void>;
/**
 * 删除音乐配置
 */
export declare const deleteMusic: (req: Request, res: Response) => Promise<void>;
/**
 * 更新音乐排序
 */
export declare const updateMusicOrder: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=musicController.d.ts.map