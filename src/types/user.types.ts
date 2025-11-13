// 6. User Types: src/types/user.types.ts
import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Email verification
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  // Account security
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  lastLoginAttempt?: Date;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  // Password security
  passwordChangedAt?: Date;
  passwordHistory?: Array<{ hash: string; changedAt: Date }>;
  // User metadata
  publicMetadata?: Map<string, any>;
  privateMetadata?: Map<string, any>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface UserRegistrationDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  id: string;
  type: 'access' | 'refresh';
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ResetPasswordRequestDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}