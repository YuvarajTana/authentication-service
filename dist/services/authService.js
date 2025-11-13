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
exports.authService = exports.AuthService = void 0;
// src/services/authService.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const userModel_1 = __importDefault(require("../models/userModel"));
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Service dedicated to authentication, token management, and authorization
 */
class AuthService {
    constructor() {
        // Load configuration from environment variables
        this.ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
        this.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
        this.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-token-secret';
        this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret';
    }
    /**
     * Generate an access token for a user
     */
    generateAccessToken(userId) {
        const payload = {
            id: userId.toString(),
            type: 'access'
        };
        const options = {
            expiresIn: this.ACCESS_TOKEN_EXPIRY
        };
        return jsonwebtoken_1.default.sign(payload, this.ACCESS_TOKEN_SECRET, options);
    }
    /**
     * Generate a refresh token for a user
     */
    generateRefreshToken(userId) {
        const payload = {
            id: userId.toString(),
            type: 'refresh'
        };
        const options = {
            expiresIn: this.REFRESH_TOKEN_EXPIRY
        };
        return jsonwebtoken_1.default.sign(payload, this.REFRESH_TOKEN_SECRET, options);
    }
    /**
     * Verify an access token
     */
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.ACCESS_TOKEN_SECRET);
            // Ensure it's an access token
            if (decoded.type !== 'access') {
                throw new errorHandler_1.AppError('Invalid token type', 401);
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errorHandler_1.AppError('Token expired', 401);
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errorHandler_1.AppError('Invalid token', 401);
            }
            else {
                throw error;
            }
        }
    }
    /**
     * Verify a refresh token
     */
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.REFRESH_TOKEN_SECRET);
            // Ensure it's a refresh token
            if (decoded.type !== 'refresh') {
                throw new errorHandler_1.AppError('Invalid token type', 401);
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errorHandler_1.AppError('Refresh token expired', 401);
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errorHandler_1.AppError('Invalid refresh token', 401);
            }
            else {
                throw error;
            }
        }
    }
    /**
     * Verify and refresh tokens
     */
    refreshTokens(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verify refresh token
            const decoded = this.verifyRefreshToken(refreshToken);
            // Check if user exists and token matches
            const user = yield userModel_1.default.findById(decoded.id);
            if (!user || user.refreshToken !== refreshToken) {
                throw new errorHandler_1.AppError('Invalid refresh token', 401);
            }
            // Generate new tokens
            const newAccessToken = this.generateAccessToken(user._id);
            const newRefreshToken = this.generateRefreshToken(user._id);
            // Save new refresh token to database
            user.refreshToken = newRefreshToken;
            yield user.save();
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        });
    }
    /**
     * Invalidate a user's refresh token
     */
    invalidateRefreshToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield userModel_1.default.findByIdAndUpdate(userId, { refreshToken: null });
        });
    }
    /**
     * Generate a random token for password reset
     */
    generateResetToken() {
        // Generate random token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        // Hash token
        const resetTokenHash = crypto_1.default
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        return {
            token: resetToken, // Plain token to send to user
            hash: resetTokenHash // Hashed token to store in database
        };
    }
    /**
     * Check if a user has a specific role
     */
    hasRole(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId);
            if (!user) {
                return false;
            }
            if (role === 'admin') {
                return user.isAdmin === true;
            }
            return true; // All authenticated users have 'user' role
        });
    }
    /**
     * Get a user's roles
     */
    getUserRoles(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId);
            if (!user) {
                return [];
            }
            const roles = ['user'];
            if (user.isAdmin) {
                roles.push('admin');
            }
            return roles;
        });
    }
    /**
     * Generate email verification token
     */
    generateEmailVerificationToken() {
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const hash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        return { token, hash };
    }
    /**
     * Set email verification token for user
     */
    setEmailVerificationToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId);
            if (!user) {
                throw new errorHandler_1.AppError('User not found', 404);
            }
            const { token, hash } = this.generateEmailVerificationToken();
            user.emailVerificationToken = hash;
            user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            yield user.save();
            return token;
        });
    }
    /**
     * Verify email with token
     */
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = crypto_1.default.createHash('sha256').update(token).digest('hex');
            const user = yield userModel_1.default.findOne({
                emailVerificationToken: hash,
                emailVerificationExpires: { $gt: Date.now() }
            });
            if (!user) {
                throw new errorHandler_1.AppError('Email verification token is invalid or has expired', 400);
            }
            user.emailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            yield user.save();
            logger_1.default.info(`Email verified for user: ${user.email}`);
        });
    }
    /**
     * Check if user's email is verified
     */
    isEmailVerified(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId);
            return (user === null || user === void 0 ? void 0 : user.emailVerified) || false;
        });
    }
}
exports.AuthService = AuthService;
// Export as singleton
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map