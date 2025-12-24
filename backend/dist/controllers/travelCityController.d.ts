import { Request, Response } from 'express';
/**
 * 获取所有旅行城市
 */
export declare const getTravelCities: (req: Request, res: Response) => Promise<void>;
/**
 * 创建旅行城市
 */
export declare const createTravelCity: (req: Request, res: Response) => Promise<void>;
/**
 * 更新旅行城市
 */
export declare const updateTravelCity: (req: Request, res: Response) => Promise<void>;
/**
 * 删除旅行城市
 */
export declare const deleteTravelCity: (req: Request, res: Response) => Promise<void>;
/**
 * 更新旅行城市排序
 */
export declare const updateTravelCityOrder: (req: Request, res: Response) => Promise<void>;
/**
 * 更新旅行城市想去人数
 */
export declare const updateWantCount: (req: Request, res: Response) => Promise<void>;
/**
 * 更新旅行城市去过人数
 */
export declare const updateBeenCount: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=travelCityController.d.ts.map