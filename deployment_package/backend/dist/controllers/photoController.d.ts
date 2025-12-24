import { Request, Response } from 'express';
import multer from 'multer';
declare const upload: multer.Multer;
export { upload };
export declare const getAllPhotos: (req: Request, res: Response) => Promise<void>;
export declare const createPhoto: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const bulkUploadPhotos: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updatePhoto: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePhoto: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPhoto: (req: Request, res: Response) => Promise<void>;
export declare const updatePhotosOrder: (req: Request, res: Response) => Promise<void>;
export declare const batchDeletePhotos: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const batchUpdateCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=photoController.d.ts.map