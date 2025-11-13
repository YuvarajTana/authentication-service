// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';
import { securityService } from '../services/securityService';
import { AppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import { z } from 'zod';
import User from '../models/userModel';

const userService = new UserService();

/**
 * Register a new user
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Already validated by Zod middleware
    const userData = req.body;
    
    // Register user
    const result = await userService.registerUser(userData);
    
    // Set refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, result.refreshToken);
    
    // Log user registration
    logger.info(`User registered: ${userData.email}`);
    
    // Return response without the refresh token in the body
    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    // Get client IP
    const clientIp = securityService.getClientIp(req);

    // Login user
    const result = await userService.loginUser({ email, password }, clientIp);

    // Set refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, result.refreshToken);

    // Log user login
    logger.info(`User login: ${email} from IP ${clientIp}`);

    // Return response without the refresh token in the body
    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Try to get the refresh token from cookie first, then from request body
    const refreshTokenFromCookie = req.cookies?.refreshToken;
    const refreshTokenFromBody = req.body?.refreshToken;
    
    const token = refreshTokenFromCookie || refreshTokenFromBody;
    
    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }
    
    // Refresh the tokens
    const tokens = await authService.refreshTokens(token);
    
    // Set the new refresh token in a cookie
    setRefreshTokenCookie(res, tokens.refreshToken);
    
    // Return only the access token in the response body
    res.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    // Clear the refresh token cookie if there was an error
    res.clearCookie('refreshToken');
    next(error);
  }
}

/**
 * Logout user
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    const userId = req.user.id;
    
    // Invalidate the refresh token
    await authService.invalidateRefreshToken(userId);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/api/users/refresh-token'
    });
    
    // Log user logout
    logger.info(`User logout: ${userId}`);
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    
    await userService.requestPasswordReset(email);
    
    // Always return success even if email doesn't exist (for security)
    res.status(200).json({ 
      message: 'If a user with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    logger.error('Password reset request error', error);
    
    // Don't expose errors to client
    res.status(200).json({ 
      message: 'If a user with that email exists, a password reset link has been sent.' 
    });
  }
}

/**
 * Reset password
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;
    
    await userService.resetPassword(token, password);
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user info
 */
export async function getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Get user roles
    const roles = await authService.getUserRoles(userId);
    
    res.status(200).json({
      user: {
        ...user.toObject(),
        roles
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Verification token is required', 400);
    }

    // Verify email
    await authService.verifyEmail(token);

    // Get user info to send welcome email
    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ emailVerificationToken: tokenHash });

    if (user) {
      try {
        await emailService.sendWelcomeEmail(user.email, user.name);
      } catch (error) {
        logger.error('Failed to send welcome email:', error);
      }
    }

    res.status(200).json({
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      res.status(200).json({
        message: 'If a user with that email exists and is not verified, a verification email has been sent.'
      });
      return;
    }

    if (user.emailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    // Generate new verification token
    const verificationToken = await authService.setEmailVerificationToken(user._id);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, verificationToken, user.name);
      logger.info(`Verification email resent to ${user.email}`);
    } catch (error) {
      logger.error('Failed to resend verification email:', error);
      throw new AppError('Failed to send verification email', 500);
    }

    res.status(200).json({
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check email verification status
 */
export async function checkEmailVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const isVerified = await authService.isEmailVerified(req.user.id);

    res.status(200).json({
      emailVerified: isVerified
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Helper function to set refresh token cookie
 */
function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh-token'
  });
}
