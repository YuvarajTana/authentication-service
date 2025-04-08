"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.resetPasswordSchema = exports.resetPasswordRequestSchema = exports.refreshTokenSchema = exports.userLoginSchema = exports.userRegistrationSchema = void 0;
// src/schemas/userSchemas.ts
const zod_1 = require("zod");
// Password validation regex pattern
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;
/**
 * User registration schema
 */
exports.userRegistrationSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Name must be at least 2 characters long')
        .max(50, 'Name cannot exceed 50 characters'),
    email: zod_1.z
        .string()
        .email('Invalid email address format'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(PASSWORD_REGEX, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    passwordConfirmation: zod_1.z
        .string()
}).refine(data => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
});
/**
 * User login schema
 */
exports.userLoginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Invalid email address format'),
    password: zod_1.z
        .string()
        .min(1, 'Password is required'),
});
/**
 * Refresh token schema
 */
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z
        .string()
        .optional()
});
/**
 * Password reset request schema
 */
exports.resetPasswordRequestSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Invalid email address format'),
});
/**
 * Password reset schema
 */
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z
        .string()
        .min(1, 'Token is required'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(PASSWORD_REGEX, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    passwordConfirmation: zod_1.z
        .string()
}).refine(data => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
});
/**
 * User profile update schema
 */
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Name must be at least 2 characters long')
        .max(50, 'Name cannot exceed 50 characters')
        .optional(),
    email: zod_1.z
        .string()
        .email('Invalid email address format')
        .optional(),
    // Add other fields that users are allowed to update
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});
//# sourceMappingURL=userSchemas.js.map