// 7. User Routes: src/routes/userRoutes.ts
import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  refreshToken, 
  logout,
  requestPasswordReset,
  resetPassword
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { 
  validateUserRegistration, 
  validateUserLogin, 
  validateRefreshToken,
  validateResetPasswordRequest,
  validateResetPassword
} from '../middleware/validation';

const router = Router();

// Auth routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/refresh-token', validateRefreshToken, refreshToken);
router.post('/logout', authenticate, logout);

// Password reset routes
router.post('/forgot-password', validateResetPasswordRequest, requestPasswordReset);
router.post('/reset-password', validateResetPassword, resetPassword);

// User profile routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;


