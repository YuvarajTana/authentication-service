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
exports.securityService = exports.SecurityService = void 0;
// src/services/securityService.ts
const userModel_1 = __importDefault(require("../models/userModel"));
const errorHandler_1 = require("../utils/errorHandler");
const emailService_1 = require("./emailService");
const logger_1 = __importDefault(require("../utils/logger"));
class SecurityService {
    constructor() {
        // Configuration
        this.MAX_LOGIN_ATTEMPTS = 5;
        this.LOCK_TIME_MINUTES = 30;
        this.ATTEMPT_WINDOW_MINUTES = 15;
    }
    /**
     * Check if account is locked
     */
    isAccountLocked(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId);
            if (!user || !user.accountLockedUntil) {
                return false;
            }
            // Check if lock period has expired
            if (user.accountLockedUntil < new Date()) {
                // Unlock the account
                user.accountLockedUntil = undefined;
                user.failedLoginAttempts = 0;
                yield user.save();
                return false;
            }
            return true;
        });
    }
    /**
     * Record failed login attempt
     */
    recordFailedLoginAttempt(email, ip) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findOne({ email });
            if (!user) {
                // Don't reveal if user exists
                return;
            }
            const now = new Date();
            // Reset attempts if last attempt was outside the window
            if (user.lastLoginAttempt) {
                const timeSinceLastAttempt = now.getTime() - user.lastLoginAttempt.getTime();
                const attemptWindowMs = this.ATTEMPT_WINDOW_MINUTES * 60 * 1000;
                if (timeSinceLastAttempt > attemptWindowMs) {
                    user.failedLoginAttempts = 0;
                }
            }
            user.failedLoginAttempts += 1;
            user.lastLoginAttempt = now;
            // Lock account if max attempts reached
            if (user.failedLoginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
                const lockUntil = new Date(now.getTime() + this.LOCK_TIME_MINUTES * 60 * 1000);
                user.accountLockedUntil = lockUntil;
                logger_1.default.warn(`Account locked for user ${email} due to ${this.MAX_LOGIN_ATTEMPTS} failed login attempts from IP ${ip}`);
                // Send email notification
                try {
                    yield emailService_1.emailService.sendAccountLockedEmail(user.email, user.name, `${this.LOCK_TIME_MINUTES} minutes`);
                }
                catch (error) {
                    logger_1.default.error('Failed to send account locked email:', error);
                }
            }
            yield user.save();
        });
    }
    /**
     * Record successful login
     */
    recordSuccessfulLogin(userId, ip) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId);
            if (!user) {
                return;
            }
            user.failedLoginAttempts = 0;
            user.accountLockedUntil = undefined;
            user.lastLoginAt = new Date();
            user.lastLoginIp = ip;
            yield user.save();
        });
    }
    /**
     * Get remaining lock time in minutes
     */
    getRemainingLockTime(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId);
            if (!user || !user.accountLockedUntil) {
                return 0;
            }
            const now = new Date();
            const remainingMs = user.accountLockedUntil.getTime() - now.getTime();
            if (remainingMs <= 0) {
                return 0;
            }
            return Math.ceil(remainingMs / (60 * 1000));
        });
    }
    /**
     * Manually unlock account (admin function)
     */
    unlockAccount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId);
            if (!user) {
                throw new errorHandler_1.AppError('User not found', 404);
            }
            user.failedLoginAttempts = 0;
            user.accountLockedUntil = undefined;
            yield user.save();
            logger_1.default.info(`Account manually unlocked for user ${user.email}`);
        });
    }
    /**
     * Check if email is verified
     */
    requireEmailVerification(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId);
            if (!user) {
                throw new errorHandler_1.AppError('User not found', 404);
            }
            if (!user.emailVerified) {
                throw new errorHandler_1.AppError('Please verify your email address before logging in', 403);
            }
        });
    }
    /**
     * Validate password strength
     */
    validatePasswordStrength(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (password.length > 128) {
            errors.push('Password must be less than 128 characters');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[^a-zA-Z0-9]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        // Check for common weak passwords
        const commonPasswords = [
            'password', 'Password123', '12345678', 'qwerty123',
            'abc123456', 'password1', 'Password1', '123456789'
        ];
        if (commonPasswords.some(weak => password.toLowerCase().includes(weak.toLowerCase()))) {
            errors.push('Password is too common. Please choose a more unique password');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Check password history to prevent reuse
     */
    checkPasswordHistory(userId_1, newPassword_1) {
        return __awaiter(this, arguments, void 0, function* (userId, newPassword, limit = 5) {
            const user = yield userModel_1.default.findById(userId);
            if (!user || !user.passwordHistory || user.passwordHistory.length === 0) {
                return true; // No history, password is unique
            }
            const bcrypt = require('bcrypt');
            // Check against recent passwords
            const recentPasswords = user.passwordHistory.slice(-limit);
            for (const oldPassword of recentPasswords) {
                const isMatch = yield bcrypt.compare(newPassword, oldPassword.hash);
                if (isMatch) {
                    return false; // Password was used before
                }
            }
            return true;
        });
    }
    /**
     * Get client IP from request
     */
    getClientIp(req) {
        var _a, _b, _c;
        return (((_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.split(',')[0].trim()) ||
            req.headers['x-real-ip'] ||
            ((_b = req.connection) === null || _b === void 0 ? void 0 : _b.remoteAddress) ||
            ((_c = req.socket) === null || _c === void 0 ? void 0 : _c.remoteAddress) ||
            'unknown');
    }
}
exports.SecurityService = SecurityService;
// Export singleton instance
exports.securityService = new SecurityService();
//# sourceMappingURL=securityService.js.map