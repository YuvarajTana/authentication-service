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
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshToken = refreshToken;
exports.logout = logout;
exports.requestPasswordReset = requestPasswordReset;
exports.resetPassword = resetPassword;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
const userService_1 = require("../services/userService");
const errorHandler_1 = require("../utils/errorHandler");
const userService = new userService_1.UserService();
function register(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userData = req.body;
            const result = yield userService.registerUser(userData);
            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/api/users/refresh-token'
            });
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
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginData = req.body;
            const result = yield userService.loginUser(loginData);
            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/api/users/refresh-token'
            });
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
function refreshToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Try to get the refresh token from cookie first, then from request body
            const refreshTokenFromCookie = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
            const refreshTokenFromBody = (_b = req.body) === null || _b === void 0 ? void 0 : _b.refreshToken;
            const refreshTokenData = {
                refreshToken: refreshTokenFromCookie || refreshTokenFromBody
            };
            if (!refreshTokenData.refreshToken) {
                throw new errorHandler_1.AppError('Refresh token is required', 400);
            }
            const result = yield userService.refreshAccessToken(refreshTokenData);
            res.status(200).json({
                accessToken: result.accessToken
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function logout(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError('Authentication required', 401);
            }
            const userId = req.user.id;
            yield userService.logoutUser(userId);
            // Clear refresh token cookie
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/api/users/refresh-token'
            });
            res.status(200).json({ message: 'Logged out successfully' });
        }
        catch (error) {
            next(error);
        }
    });
}
function requestPasswordReset(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resetData = req.body;
            yield userService.requestPasswordReset(resetData.email);
            // Always return success even if email doesn't exist (for security)
            res.status(200).json({
                message: 'If a user with that email exists, a password reset link has been sent.'
            });
        }
        catch (error) {
            // Don't expose errors to client for security
            console.error(error);
            res.status(200).json({
                message: 'If a user with that email exists, a password reset link has been sent.'
            });
        }
    });
}
function resetPassword(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resetData = req.body;
            yield userService.resetPassword(resetData.token, resetData.password);
            res.status(200).json({ message: 'Password has been reset successfully' });
        }
        catch (error) {
            next(error);
        }
    });
}
function getProfile(req, res, next) {
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
            res.status(200).json({ user });
        }
        catch (error) {
            next(error);
        }
    });
}
function updateProfile(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError('Authentication required', 401);
            }
            const userId = req.user.id;
            const updateData = req.body;
            const updatedUser = yield userService.updateUser(userId, updateData);
            res.status(200).json({ user: updatedUser });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=userController.js.map