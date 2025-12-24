import { Request, Response } from 'express';
export declare const getAllSkills: (req: Request, res: Response) => Promise<void>;
export declare const getSkillById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createSkill: (req: Request, res: Response) => Promise<void>;
export declare const updateSkill: (req: Request, res: Response) => Promise<void>;
export declare const deleteSkill: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=skillController.d.ts.map