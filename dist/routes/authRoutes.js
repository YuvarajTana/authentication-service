"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
// src/routes/authRoutes.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const zodValidation_1 = require("../middleware/zodValidation");
const userSchemas_1 = require("../schemas/userSchemas");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (0, zodValidation_1.validateRequest)(userSchemas_1.userRegistrationSchema), authController_1.register);
/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT tokens
 * @access  Public
 */
router.post('/login', (0, zodValidation_1.validateRequest)(userSchemas_1.userLoginSchema), authController_1.login);
/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh-token', (0, zodValidation_1.validateRequest)(userSchemas_1.refreshTokenSchema), authController_1.refreshToken);
/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', auth_1.authenticate, authController_1.logout);
/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password', (0, zodValidation_1.validateRequest)(userSchemas_1.resetPasswordRequestSchema), authController_1.requestPasswordReset);
/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', (0, zodValidation_1.validateRequest)(userSchemas_1.resetPasswordSchema), authController_1.resetPassword);
/**
 * @route   GET /api/auth/me
 * @desc    Get current user information
 * @access  Private
 */
router.get('/me', auth_1.authenticate, authController_1.getCurrentUser);
/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email', authController_1.verifyEmail);
/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/resend-verification', authController_1.resendVerificationEmail);
/**
 * @route   GET /api/auth/check-verification
 * @desc    Check if user's email is verified
 * @access  Private
 */
router.get('/check-verification', auth_1.authenticate, authController_1.checkEmailVerification);
exports.default = router;
const authRoutes_1 = __importDefault(require("../routes/authRoutes"));
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
const productRoutes_1 = __importDefault(require("../routes/productRoutes"));
const errorMiddleware_1 = require("../middleware/errorMiddleware");
function setupRoutes(app) {
    // API routes
    app.use('/api/auth', authRoutes_1.default);
    app.use('/api/users', userRoutes_1.default);
    app.use('/api/products', productRoutes_1.default);
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });
    // Handle 404s
    app.use(errorMiddleware_1.notFoundHandler);
}
//# sourceMappingURL=authRoutes.js.map