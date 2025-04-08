// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/errorHandler';

/**
 * Generic validation middleware factory
 */
const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }
    
    next();
  };
};

/**
 * User registration validation schema
 */
const userRegistrationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .message('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  passwordConfirmation: Joi.string().valid(Joi.ref('password'))
    .messages({ 'any.only': 'Passwords do not match' })
});

/**
 * User login validation schema
 */
const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * Refresh token validation schema
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
});

/**
 * Password reset request validation schema
 */
const resetPasswordRequestSchema = Joi.object({
  email: Joi.string().email().required()
});

/**
 * Password reset validation schema
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .message('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  passwordConfirmation: Joi.string().valid(Joi.ref('password'))
    .messages({ 'any.only': 'Passwords do not match' })
});

// Export validation middleware
export const validateUserRegistration = validate(userRegistrationSchema);
export const validateUserLogin = validate(userLoginSchema);
export const validateRefreshToken = validate(refreshTokenSchema);
export const validateResetPasswordRequest = validate(resetPasswordRequestSchema);
export const validateResetPassword = validate(resetPasswordSchema);