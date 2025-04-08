// src/routes/authRoutes.ts
import { Router } from 'express';
import { 
  register, 
  login, 
  refreshToken, 
  logout,
  requestPasswordReset,
  resetPassword,
  getCurrentUser
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/zodValidation';
import {
  userRegistrationSchema,
  userLoginSchema,
  refreshTokenSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema
} from '../schemas/userSchemas';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register', 
  validateRequest(userRegistrationSchema), 
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT tokens
 * @access  Public
 */
router.post(
  '/login', 
  validateRequest(userLoginSchema), 
  login
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post(
  '/refresh-token', 
  validateRequest(refreshTokenSchema), 
  refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post(
  '/logout', 
  authenticate, 
  logout
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post(
  '/forgot-password', 
  validateRequest(resetPasswordRequestSchema), 
  requestPasswordReset
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password', 
  validateRequest(resetPasswordSchema), 
  resetPassword
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user information
 * @access  Private
 */
router.get(
  '/me', 
  authenticate, 
  getCurrentUser
);

export default router;

// src/config/app.ts - Update to include auth routes
import { Application } from 'express';
import authRoutes from '../routes/authRoutes';
import userRoutes from '../routes/userRoutes';
import productRoutes from '../routes/productRoutes';
import { notFoundHandler } from '../middleware/errorMiddleware';

export function setupRoutes(app: Application): void {
  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // Handle 404s
  app.use(notFoundHandler);
}