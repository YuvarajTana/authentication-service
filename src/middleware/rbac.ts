// src/middleware/rbac.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AppError } from '../utils/errorHandler';

/**
 * Middleware factory for role-based access control
 * @param requiredRoles Array of roles allowed to access the resource
 */
export function requireRoles(requiredRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      const userId = req.user.id;
      
      // Get user's roles
      const userRoles = await authService.getUserRoles(userId);
      
      // Check if the user has any of the required roles
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        throw new AppError(
          `Access denied: Required role(s): ${requiredRoles.join(', ')}`, 
          403
        );
      }
      
      // Add roles to request for potential use in controllers
      req.user.roles = userRoles;
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Common role check middleware functions
export const isAdmin = requireRoles(['admin']);
export const isUser = requireRoles(['user']);
export const isAdminOrUser = requireRoles(['admin', 'user']);

// Permission-based middleware for finer-grained control
export const hasPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      const userId = req.user.id;
      
      // For simplicity, we're mapping permissions to roles
      // In a real app, you might have a more complex permission system
      const permissionMap: Record<string, string[]> = {
        'create:products': ['admin'],
        'update:products': ['admin'],
        'delete:products': ['admin'],
        'read:products': ['admin', 'user'],
        'read:own-profile': ['admin', 'user'],
        'update:own-profile': ['admin', 'user']
      };
      
      const requiredRoles = permissionMap[permission] || [];
      const userRoles = await authService.getUserRoles(userId);
      
      const hasPermission = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasPermission) {
        throw new AppError(`Access denied: Required permission: ${permission}`, 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Resource ownership middleware
export const isResourceOwner = (resourceModelFn: (req: Request) => Promise<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      const userId = req.user.id;
      const userRoles = await authService.getUserRoles(userId);
      
      // Admins can access any resource
      if (userRoles.includes('admin')) {
        return next();
      }
      
      // Get the resource
      const resource = await resourceModelFn(req);
      
      // Check if resource exists
      if (!resource) {
        throw new AppError('Resource not found', 404);
      }
      
      // Check if user owns the resource
      const isOwner = resource.userId?.toString() === userId.toString();
      
      if (!isOwner) {
        throw new AppError('Access denied: You do not own this resource', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// User interface is now defined in auth.ts
