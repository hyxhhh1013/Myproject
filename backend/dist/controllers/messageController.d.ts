import { Request, Response } from 'express';
export declare const createMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllMessages: (req: Request, res: Response) => Promise<void>;
export declare const deleteMessage: (req: Request, res: Response) => Promise<void>;
export declare const markAsRead: (req: Request, res: Response) => Promise<void>;
export declare const batchMarkAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const batchDeleteMessages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=messageController.d.ts.map