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