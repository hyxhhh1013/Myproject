import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (req: any, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  // Return the promise so routes that `await handler(req, res, next)` before
  // clearing caches really wait for the DB write to finish.
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
};
