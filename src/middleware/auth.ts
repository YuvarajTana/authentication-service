// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AppError } from '../utils/errorHandler';
import logger from '../utils/logger';

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. No token provided.', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    try {
      const decoded = authService.verifyAccessToken(token);
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      // Handle specific token errors
      if (error instanceof AppError) {
        if (error.message === 'Token expired') {
          // Return a specific error for expired tokens to help client refresh
          throw new AppError('Access token expired, please refresh your token', 401);
        }
        throw error;
      }
      
      // Handle unexpected errors
      logger.error('Authentication error', error);
      throw new AppError('Authentication failed', 401);
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Tries to authenticate but continues if no token is provided
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // If no token, continue without authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    try {
      const decoded = authService.verifyAccessToken(token);
      req.user = { id: decoded.id };
    } catch (error) {
      // Ignore token errors in optional authentication
      logger.debug('Optional authentication failed', error);
    }
    
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Authentication check middleware
 * Checks if user is authenticated but doesn't require it
 * Sets req.isAuthenticated flag
 */
export function checkAuthentication(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // Default to not authenticated
    req.isAuthenticated = false;
    
    // If no token, continue without authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    try {
      const decoded = authService.verifyAccessToken(token);
      req.user = { id: decoded.id };
      req.isAuthenticated = true;
    } catch (error) {
      // Ignore token errors in authentication check
      logger.debug('Authentication check failed', error);
    }
    
    next();
  } catch (error) {
    next(error);
  }
}

// Extend Request interface to include authentication properties
declare global {
  namespace Express {
    interface Request {
      user?: User;
      isAuthenticated?: boolean;
    }
    
    interface User {
      id: string;
      roles?: string[];
    }
  }
}
