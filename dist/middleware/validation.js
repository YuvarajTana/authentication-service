"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = exports.validateResetPasswordRequest = exports.validateRefreshToken = exports.validateUserLogin = exports.validateUserRegistration = void 0;
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = require("../utils/errorHandler");
/**
 * Generic validation middleware factory
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');
            return next(new errorHandler_1.AppError(errorMessage, 400));
        }
        next();
    };
};
/**
 * User registration validation schema
 */
const userRegistrationSchema = joi_1.default.object({
    name: joi_1.default.string().trim().min(2).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .message('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    passwordConfirmation: joi_1.default.string().valid(joi_1.default.ref('password'))
        .messages({ 'any.only': 'Passwords do not match' })
});
/**
 * User login validation schema
 */
const userLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
/**
 * Refresh token validation schema
 */
const refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string()
});
/**
 * Password reset request validation schema
 */
const resetPasswordRequestSchema = joi_1.default.object({
    email: joi_1.default.string().email().required()
});
/**
 * Password reset validation schema
 */
const resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required(),
    password: joi_1.default.string().min(8).required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .message('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    passwordConfirmation: joi_1.default.string().valid(joi_1.default.ref('password'))
        .messages({ 'any.only': 'Passwords do not match' })
});
// Export validation middleware
exports.validateUserRegistration = validate(userRegistrationSchema);
exports.validateUserLogin = validate(userLoginSchema);
exports.validateRefreshToken = validate(refreshTokenSchema);
exports.validateResetPasswordRequest = validate(resetPasswordRequestSchema);
exports.validateResetPassword = validate(resetPasswordSchema);
//# sourceMappingURL=validation.js.map