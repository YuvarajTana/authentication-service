// src/services/authService.ts
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/userModel';
import { TokenPayload } from '../types/user.types';
import { AppError } from '../utils/errorHandler';
import logger from '../utils/logger';

/**
 * Service dedicated to authentication, token management, and authorization
 */
export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY: string;
  private readonly REFRESH_TOKEN_EXPIRY: string;
  private readonly ACCESS_TOKEN_SECRET: jwt.Secret;
  private readonly REFRESH_TOKEN_SECRET: jwt.Secret;
  
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
  generateAccessToken(userId: string): string {
    const payload: TokenPayload = {
      id: userId.toString(),
      type: 'access'
    };
    
    const options: SignOptions = { 
      expiresIn: this.ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn']
    };
    
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET as Secret, options);
  }
  
  /**
   * Generate a refresh token for a user
   */
  generateRefreshToken(userId: string): string {
    const payload: TokenPayload = {
      id: userId.toString(),
      type: 'refresh'
    };
    
    const options: SignOptions = { 
      expiresIn: this.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn']
    };
    
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET as Secret, options);
  }
  
  /**
   * Verify an access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
      
      // Ensure it's an access token
      if (decoded.type !== 'access') {
        throw new AppError('Invalid token type', 401);
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Verify a refresh token
   */
  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as TokenPayload;
      
      // Ensure it's a refresh token
      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type', 401);
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired', 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Verify and refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
    // Verify refresh token
    const decoded = this.verifyRefreshToken(refreshToken);
    
    // Check if user exists and token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }
    
    // Generate new tokens
    const newAccessToken = this.generateAccessToken(user._id);
    const newRefreshToken = this.generateRefreshToken(user._id);
    
    // Save new refresh token to database
    user.refreshToken = newRefreshToken;
    await user.save();
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
  
  /**
   * Invalidate a user's refresh token
   */
  async invalidateRefreshToken(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
  
  /**
   * Generate a random token for password reset
   */
  generateResetToken(): { token: string, hash: string } {
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token
    const resetTokenHash = crypto
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
  async hasRole(userId: string, role: 'admin' | 'user'): Promise<boolean> {
    const user = await User.findById(userId);
    
    if (!user) {
      return false;
    }
    
    if (role === 'admin') {
      return user.isAdmin === true;
    }
    
    return true; // All authenticated users have 'user' role
  }
  
  /**
   * Get a user's roles
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const user = await User.findById(userId);

    if (!user) {
      return [];
    }

    const roles = ['user'];

    if (user.isAdmin) {
      roles.push('admin');
    }

    return roles;
  }

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken(): { token: string, hash: string } {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    return { token, hash };
  }

  /**
   * Set email verification token for user
   */
  async setEmailVerificationToken(userId: string): Promise<string> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { token, hash } = this.generateEmailVerificationToken();

    user.emailVerificationToken = hash;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    return token;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hash,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Email verification token is invalid or has expired', 400);
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);
  }

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await User.findById(userId);
    return user?.emailVerified || false;
  }
}

// Export as singleton
export const authService = new AuthService();
