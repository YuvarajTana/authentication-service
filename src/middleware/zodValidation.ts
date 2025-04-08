// src/middleware/zodValidation.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodType } from 'zod';
import { AppError } from '../utils/errorHandler';

/**
 * Generic validation middleware factory using Zod
 * This middleware validates the request body against a provided Zod schema
 */
export const validateRequest = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate the request body
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        next(new AppError(
          `Validation error: ${formattedErrors.map(e => `${e.path}: ${e.message}`).join(', ')}`, 
          400
        ));
      } else {
        next(error);
      }
    }
  };
};

// You can also add specialized middleware for validating query parameters, path parameters, etc.
export const validateQuery = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        next(new AppError(
          `Query validation error: ${formattedErrors.map(e => `${e.path}: ${e.message}`).join(', ')}`, 
          400
        ));
      } else {
        next(error);
      }
    }
  };
};

export const validateParams = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        next(new AppError(
          `Path parameter validation error: ${formattedErrors.map(e => `${e.path}: ${e.message}`).join(', ')}`, 
          400
        ));
      } else {
        next(error);
      }
    }
  };
};
