import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token - ensure JWT_SECRET is set in environment
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not set');
      }

      // Verify token with expiration check
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

      // Add user to request
      req.user = decoded;

      next();
    } catch (error) {
      logger.error('Authentication failed', { error: error instanceof Error ? error.message : 'Unknown error', path: req.path, method: req.method });
      return res.status(401).json({ status: 'fail', message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Not authorized, no token' });
  }
};
