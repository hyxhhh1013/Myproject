import { Request, Response } from 'express';
export declare const getAllCategories: (req: Request, res: Response) => Promise<void>;
export declare const createCategory: (req: Request, res: Response) => Promise<void>;
export declare const updateCategory: (req: Request, res: Response) => Promise<void>;
export declare const deleteCategory: (req: Request, res: Response) => Promise<void>;
export declare const getCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=photoCategoryController.d.ts.map