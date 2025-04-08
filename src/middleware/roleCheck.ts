// src/middleware/roleCheck.ts
import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import { AppError } from '../utils/errorHandler';

export async function isAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      throw new AppError('Access denied: Admin privileges required', 403);
    }
    
    next();
  } catch (error) {
    next(error);
  }
}
