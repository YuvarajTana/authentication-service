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
exports.emailService = exports.EmailService = void 0;
// src/services/emailService.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../utils/logger"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
            port: parseInt(process.env.EMAIL_PORT || '2525'),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    /**
     * Send an email
     */
    sendEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transporter.sendMail({
                    from: process.env.EMAIL_FROM || 'noreply@example.com',
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                    text: options.text,
                });
                logger_1.default.info(`Email sent to ${options.to}: ${options.subject}`);
            }
            catch (error) {
                logger_1.default.error('Error sending email:', error);
                throw error;
            }
        });
    }
    /**
     * Send email verification email
     */
    sendVerificationEmail(email, token, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
            const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for signing up. Please verify your email address to activate your account.</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
            const text = `
      Welcome, ${name}!

      Thank you for signing up. Please verify your email address by clicking the link below:

      ${verificationUrl}

      This link will expire in 24 hours.

      If you didn't create an account, please ignore this email.
    `;
            yield this.sendEmail({
                to: email,
                subject: 'Verify Your Email Address',
                html,
                text,
            });
        });
    }
    /**
     * Send password reset email
     */
    sendPasswordResetEmail(email, token, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <div class="footer">
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
          </div>
        </body>
      </html>
    `;
            const text = `
      Password Reset Request

      Hi ${name},

      We received a request to reset your password. Click the link below to create a new password:

      ${resetUrl}

      This link will expire in 1 hour.

      If you didn't request a password reset, please ignore this email.
    `;
            yield this.sendEmail({
                to: email,
                subject: 'Reset Your Password',
                html,
                text,
            });
        });
    }
    /**
     * Send account locked notification
     */
    sendAccountLockedEmail(email, name, lockDuration) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Temporarily Locked</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Account Temporarily Locked</h2>
            <p>Hi ${name},</p>
            <div class="alert">
              <p><strong>Security Alert:</strong> Your account has been temporarily locked due to multiple failed login attempts.</p>
            </div>
            <p>Your account will be automatically unlocked in <strong>${lockDuration}</strong>.</p>
            <p>If this wasn't you, please contact our support team immediately.</p>
            <div class="footer">
              <p>This is an automated security notification.</p>
            </div>
          </div>
        </body>
      </html>
    `;
            const text = `
      Account Temporarily Locked

      Hi ${name},

      Your account has been temporarily locked due to multiple failed login attempts.

      Your account will be automatically unlocked in ${lockDuration}.

      If this wasn't you, please contact our support team immediately.
    `;
            yield this.sendEmail({
                to: email,
                subject: 'Account Temporarily Locked - Security Alert',
                html,
                text,
            });
        });
    }
    /**
     * Send welcome email after email verification
     */
    sendWelcomeEmail(email, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { background-color: #d4edda; border-left: 4px solid #28a745; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Our Platform!</h2>
            <p>Hi ${name},</p>
            <div class="success">
              <p><strong>Email Verified Successfully!</strong> Your account is now active.</p>
            </div>
            <p>You can now enjoy all the features of our platform.</p>
            <p>Thank you for joining us!</p>
          </div>
        </body>
      </html>
    `;
            const text = `
      Welcome to Our Platform!

      Hi ${name},

      Email Verified Successfully! Your account is now active.

      You can now enjoy all the features of our platform.

      Thank you for joining us!
    `;
            yield this.sendEmail({
                to: email,
                subject: 'Welcome! Your Email is Verified',
                html,
                text,
            });
        });
    }
}
exports.EmailService = EmailService;
// Export singleton instance
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map