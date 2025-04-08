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
exports.UserService = void 0;
// 9. User Service: src/services/userService.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const userModel_1 = __importDefault(require("../models/userModel"));
const errorHandler_1 = require("../utils/errorHandler");
// import { sendPasswordResetEmail } from '../utils/emailService'; Todo
class UserService {
    constructor() {
        this.ACCESS_TOKEN_EXPIRY = '15m';
        this.REFRESH_TOKEN_EXPIRY = '7d';
        this.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-token-secret';
        this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret';
    }
    registerUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = userData;
            // Check if user already exists
            const existingUser = yield userModel_1.default.findOne({ email });
            if (existingUser) {
                throw new errorHandler_1.AppError('User with this email already exists', 400);
            }
            // Create new user
            const user = new userModel_1.default(userData);
            // Generate tokens
            const accessToken = this.generateAccessToken(user._id);
            const refreshToken = this.generateRefreshToken(user._id);
            // Save refresh token to user
            user.refreshToken = refreshToken;
            yield user.save();
            return {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin
                },
                accessToken,
                refreshToken
            };
        });
    }
    loginUser(loginData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = loginData;
            // Find user
            const user = yield userModel_1.default.findOne({ email });
            if (!user) {
                throw new errorHandler_1.AppError('Invalid email or password', 401);
            }
            // Check password
            const isPasswordValid = yield user.comparePassword(password);
            if (!isPasswordValid) {
                throw new errorHandler_1.AppError('Invalid email or password', 401);
            }
            // Generate tokens
            const accessToken = this.generateAccessToken(user._id);
            const refreshToken = this.generateRefreshToken(user._id);
            // Save refresh token to user
            user.refreshToken = refreshToken;
            yield user.save();
            return {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin
                },
                accessToken,
                refreshToken
            };
        });
    }
    refreshAccessToken(refreshTokenData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = refreshTokenData;
            // Verify refresh token
            try {
                const decoded = jsonwebtoken_1.default.verify(refreshToken, this.REFRESH_TOKEN_SECRET);
                if (decoded.type !== 'refresh') {
                    throw new errorHandler_1.AppError('Invalid token type', 401);
                }
                // Check if user exists and token matches
                const user = yield userModel_1.default.findById(decoded.id);
                if (!user || user.refreshToken !== refreshToken) {
                    throw new errorHandler_1.AppError('Invalid refresh token', 401);
                }
                // Generate new access token
                const accessToken = this.generateAccessToken(user._id);
                return { accessToken };
            }
            catch (error) {
                throw new errorHandler_1.AppError('Invalid refresh token', 401);
            }
        });
    }
    logoutUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield userModel_1.default.findByIdAndUpdate(userId, { refreshToken: null });
        });
    }
    requestPasswordReset(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findOne({ email });
            // If user doesn't exist, just return (don't expose this information)
            if (!user)
                return;
            // Generate reset token
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            // Hash token and save to user
            const resetTokenHash = crypto_1.default
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');
            user.resetPasswordToken = resetTokenHash;
            user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            yield user.save();
            // Send email with reset link
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            // await sendPasswordResetEmail(user.email, resetUrl);
        });
    }
    resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            // Hash token to compare with stored hash
            const resetTokenHash = crypto_1.default
                .createHash('sha256')
                .update(token)
                .digest('hex');
            // Find user with this token and check if it's not expired
            const user = yield userModel_1.default.findOne({
                resetPasswordToken: resetTokenHash,
                resetPasswordExpires: { $gt: Date.now() }
            });
            if (!user) {
                throw new errorHandler_1.AppError('Password reset token is invalid or has expired', 400);
            }
            // Update password and clear reset token fields
            user.password = newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            user.refreshToken = undefined; // Invalidate all sessions
            yield user.save();
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
            return user;
        });
    }
    updateUser(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Prevent updating sensitive fields
            const safeUpdateData = Object.assign({}, updateData);
            delete safeUpdateData.password;
            const updatedUser = yield userModel_1.default.findByIdAndUpdate(userId, { $set: safeUpdateData }, { new: true, runValidators: true }).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
            return updatedUser;
        });
    }
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
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map