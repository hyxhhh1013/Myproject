import { Request, Response } from 'express';
import multer from 'multer';
declare const upload: multer.Multer;
export { upload };
export declare const getAllProjects: (req: Request, res: Response) => Promise<void>;
export declare const getProjectById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createProject: (req: Request, res: Response) => Promise<void>;
export declare const updateProject: (req: Request, res: Response) => Promise<void>;
export declare const deleteProject: (req: Request, res: Response) => Promise<void>;
export declare const uploadProjectDemo: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=projectController.d.ts.map