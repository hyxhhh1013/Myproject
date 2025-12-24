import { Request, Response } from 'express';
export declare const getAllSocialMedia: (req: Request, res: Response) => Promise<void>;
export declare const getSocialMediaById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createSocialMedia: (req: Request, res: Response) => Promise<void>;
export declare const updateSocialMedia: (req: Request, res: Response) => Promise<void>;
export declare const deleteSocialMedia: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=socialMediaController.d.ts.map