// src/services/securityService.ts
import User from '../models/userModel';
import { AppError } from '../utils/errorHandler';
import { emailService } from './emailService';
import logger from '../utils/logger';

export class SecurityService {
  // Configuration
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME_MINUTES = 30;
  private readonly ATTEMPT_WINDOW_MINUTES = 15;

  /**
   * Check if account is locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await User.findById(userId);

    if (!user || !user.accountLockedUntil) {
      return false;
    }

    // Check if lock period has expired
    if (user.accountLockedUntil < new Date()) {
      // Unlock the account
      user.accountLockedUntil = undefined;
      user.failedLoginAttempts = 0;
      await user.save();
      return false;
    }

    return true;
  }

  /**
   * Record failed login attempt
   */
  async recordFailedLoginAttempt(email: string, ip: string): Promise<void> {
    const user = await User.findOne({ email });

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

      logger.warn(`Account locked for user ${email} due to ${this.MAX_LOGIN_ATTEMPTS} failed login attempts from IP ${ip}`);

      // Send email notification
      try {
        await emailService.sendAccountLockedEmail(
          user.email,
          user.name,
          `${this.LOCK_TIME_MINUTES} minutes`
        );
      } catch (error) {
        logger.error('Failed to send account locked email:', error);
      }
    }

    await user.save();
  }

  /**
   * Record successful login
   */
  async recordSuccessfulLogin(userId: string, ip: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      return;
    }

    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;

    await user.save();
  }

  /**
   * Get remaining lock time in minutes
   */
  async getRemainingLockTime(userId: string): Promise<number> {
    const user = await User.findById(userId);

    if (!user || !user.accountLockedUntil) {
      return 0;
    }

    const now = new Date();
    const remainingMs = user.accountLockedUntil.getTime() - now.getTime();

    if (remainingMs <= 0) {
      return 0;
    }

    return Math.ceil(remainingMs / (60 * 1000));
  }

  /**
   * Manually unlock account (admin function)
   */
  async unlockAccount(userId: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;

    await user.save();
    logger.info(`Account manually unlocked for user ${user.email}`);
  }

  /**
   * Check if email is verified
   */
  async requireEmailVerification(userId: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.emailVerified) {
      throw new AppError('Please verify your email address before logging in', 403);
    }
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

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
  async checkPasswordHistory(userId: string, newPassword: string, limit: number = 5): Promise<boolean> {
    const user = await User.findById(userId);

    if (!user || !user.passwordHistory || user.passwordHistory.length === 0) {
      return true; // No history, password is unique
    }

    const bcrypt = require('bcrypt');

    // Check against recent passwords
    const recentPasswords = user.passwordHistory.slice(-limit);

    for (const oldPassword of recentPasswords) {
      const isMatch = await bcrypt.compare(newPassword, oldPassword.hash);
      if (isMatch) {
        return false; // Password was used before
      }
    }

    return true;
  }

  /**
   * Get client IP from request
   */
  getClientIp(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }
}

// Export singleton instance
export const securityService = new SecurityService();
