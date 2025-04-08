"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshToken = refreshToken;
exports.logout = logout;
exports.requestPasswordReset = requestPasswordReset;
exports.resetPassword = resetPassword;
exports.getCurrentUser = getCurrentUser;
const userService_1 = require("../services/userService");
const authService_1 = require("../services/authService");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const userService = new userService_1.UserService();
/**
 * Register a new user
 */
function register(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Already validated by Zod middleware
            const userData = req.body;
            // Register user
            const result = yield userService.registerUser(userData);
            // Set refresh token in HTTP-only cookie
            setRefreshTokenCookie(res, result.refreshToken);
            // Log user registration
            logger_1.default.info(`User registered: ${userData.email}`);
            // Return response without the refresh token in the body
            res.status(201).json({
                user: result.user,
                accessToken: result.accessToken
            });
        }
        catch (error) {
            next(error);
        }
    });
}
/**
 * Login user
 */
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            // Login user
            const result = yield userService.loginUser({ email, password });
            // Set refresh token in HTTP-only cookie
            setRefreshTokenCookie(res, result.refreshToken);
            // Log user login
            logger_1.default.info(`User login: ${email}`);
            // Return response without the refresh token in the body
            res.status(200).json({
                user: result.user,
                accessToken: result.accessToken
            });
        }
        catch (error) {
            next(error);
        }
    });
}
/**
 * Refresh access token
 */
function refreshToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Try to get the refresh token from cookie first, then from request body
            const refreshTokenFromCookie = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
            const refreshTokenFromBody = (_b = req.body) === null || _b === void 0 ? void 0 : _b.refreshToken;
            const token = refreshTokenFromCookie || refreshTokenFromBody;
            if (!token) {
                throw new errorHandler_1.AppError('Refresh token is required', 400);
            }
            // Refresh the tokens
            const tokens = yield authService_1.authService.refreshTokens(token);
            // Set the new refresh token in a cookie
            setRefreshTokenCookie(res, tokens.refreshToken);
            // Return only the access token in the response body
            res.status(200).json({ accessToken: tokens.accessToken });
        }
        catch (error) {
            // Clear the refresh token cookie if there was an error
            res.clearCookie('refreshToken');
            next(error);
        }
    });
}
/**
 * Logout user
 */
function logout(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError('Authentication required', 401);
            }
            const userId = req.user.id;
            // Invalidate the refresh token
            yield authService_1.authService.invalidateRefreshToken(userId);
            // Clear refresh token cookie
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/api/users/refresh-token'
            });
            // Log user logout
            logger_1.default.info(`User logout: ${userId}`);
            res.status(200).json({ message: 'Logged out successfully' });
        }
        catch (error) {
            next(error);
        }
    });
}
/**
 * Request password reset
 */
function requestPasswordReset(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            yield userService.requestPasswordReset(email);
            // Always return success even if email doesn't exist (for security)
            res.status(200).json({
                message: 'If a user with that email exists, a password reset link has been sent.'
            });
        }
        catch (error) {
            logger_1.default.error('Password reset request error', error);
            // Don't expose errors to client
            res.status(200).json({
                message: 'If a user with that email exists, a password reset link has been sent.'
            });
        }
    });
}
/**
 * Reset password
 */
function resetPassword(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token, password } = req.body;
            yield userService.resetPassword(token, password);
            res.status(200).json({ message: 'Password has been reset successfully' });
        }
        catch (error) {
            next(error);
        }
    });
}
/**
 * Get current user info
 */
function getCurrentUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError('Authentication required', 401);
            }
            const userId = req.user.id;
            const user = yield userService.getUserById(userId);
            if (!user) {
                throw new errorHandler_1.AppError('User not found', 404);
            }
            // Get user roles
            const roles = yield authService_1.authService.getUserRoles(userId);
            res.status(200).json({
                user: Object.assign(Object.assign({}, user.toObject()), { roles })
            });
        }
        catch (error) {
            next(error);
        }
    });
}
/**
 * Helper function to set refresh token cookie
 */
function setRefreshTokenCookie(res, token) {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth/refresh-token'
    });
}
//# sourceMappingURL=authController.js.map