import { Request, Response } from 'express';
export declare const getAllEducation: (req: Request, res: Response) => Promise<void>;
export declare const getEducationById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createEducation: (req: Request, res: Response) => Promise<void>;
export declare const updateEducation: (req: Request, res: Response) => Promise<void>;
export declare const deleteEducation: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=educationController.d.ts.map