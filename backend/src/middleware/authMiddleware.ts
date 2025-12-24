import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Add user to request
      req.user = decoded;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ status: 'fail', message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'Not authorized, no token' });
  }
};
