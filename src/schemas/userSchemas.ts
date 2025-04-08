// src/schemas/userSchemas.ts
import { z } from 'zod';

// Password validation regex pattern
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;

/**
 * User registration schema
 */
export const userRegistrationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters'),
  
  email: z
    .string()
    .email('Invalid email address format'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      PASSWORD_REGEX, 
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  
  passwordConfirmation: z
    .string()
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
});

// Type inference from the schema
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;

/**
 * User login schema
 */
export const userLoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address format'),
  
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type UserLoginInput = z.infer<typeof userLoginSchema>;

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .optional()
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * Password reset request schema
 */
export const resetPasswordRequestSchema = z.object({
  email: z
    .string()
    .email('Invalid email address format'),
});

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;

/**
 * Password reset schema
 */
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Token is required'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      PASSWORD_REGEX, 
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  
  passwordConfirmation: z
    .string()
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * User profile update schema
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters')
    .optional(),
  
  email: z
    .string()
    .email('Invalid email address format')
    .optional(),
    
  // Add other fields that users are allowed to update
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;