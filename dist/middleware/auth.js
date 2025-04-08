"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuthenticate = optionalAuthenticate;
exports.checkAuthentication = checkAuthentication;
const authService_1 = require("../services/authService");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
function authenticate(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('Authentication required. No token provided.', 401);
        }
        const token = authHeader.split(' ')[1];
        // Verify token
        try {
            const decoded = authService_1.authService.verifyAccessToken(token);
            req.user = { id: decoded.id };
            next();
        }
        catch (error) {
            // Handle specific token errors
            if (error instanceof errorHandler_1.AppError) {
                if (error.message === 'Token expired') {
                    // Return a specific error for expired tokens to help client refresh
                    throw new errorHandler_1.AppError('Access token expired, please refresh your token', 401);
                }
                throw error;
            }
            // Handle unexpected errors
            logger_1.default.error('Authentication error', error);
            throw new errorHandler_1.AppError('Authentication failed', 401);
        }
    }
    catch (error) {
        next(error);
    }
}
/**
 * Optional authentication middleware
 * Tries to authenticate but continues if no token is provided
 */
function optionalAuthenticate(req, res, next) {
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
            const decoded = authService_1.authService.verifyAccessToken(token);
            req.user = { id: decoded.id };
        }
        catch (error) {
            // Ignore token errors in optional authentication
            logger_1.default.debug('Optional authentication failed', error);
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
/**
 * Authentication check middleware
 * Checks if user is authenticated but doesn't require it
 * Sets req.isAuthenticated flag
 */
function checkAuthentication(req, res, next) {
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
            const decoded = authService_1.authService.verifyAccessToken(token);
            req.user = { id: decoded.id };
            req.isAuthenticated = true;
        }
        catch (error) {
            // Ignore token errors in authentication check
            logger_1.default.debug('Authentication check failed', error);
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.js.map