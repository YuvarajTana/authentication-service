
// 10. Authentication Middleware: src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errorHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
      };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }
    
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    try {
      const decoded = jwt.verify(token, secret) as { id: string };
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  } catch (error) {
    next(error);
  }
}
