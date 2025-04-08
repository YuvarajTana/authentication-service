// 8. User Controller: src/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { 
  UserLoginDto, 
  UserRegistrationDto, 
  RefreshTokenDto,
  ResetPasswordRequestDto,
  ResetPasswordDto
} from '../types/user.types';
import { AppError } from '../utils/errorHandler';

const userService = new UserService();

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userData: UserRegistrationDto = req.body;
    const result = await userService.registerUser(userData);
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/users/refresh-token'
    });
    
    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const loginData: UserLoginDto = req.body;
    const result = await userService.loginUser(loginData);
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/users/refresh-token'
    });
    
    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Try to get the refresh token from cookie first, then from request body
    const refreshTokenFromCookie = req.cookies?.refreshToken;
    const refreshTokenFromBody = req.body?.refreshToken;
    
    const refreshTokenData: RefreshTokenDto = {
      refreshToken: refreshTokenFromCookie || refreshTokenFromBody
    };
    
    if (!refreshTokenData.refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }
    
    const result = await userService.refreshAccessToken(refreshTokenData);
    
    res.status(200).json({
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    const userId = req.user.id;
    await userService.logoutUser(userId);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/api/users/refresh-token'
    });
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resetData: ResetPasswordRequestDto = req.body;
    await userService.requestPasswordReset(resetData.email);
    
    // Always return success even if email doesn't exist (for security)
    res.status(200).json({ 
      message: 'If a user with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    // Don't expose errors to client for security
    console.error(error);
    res.status(200).json({ 
      message: 'If a user with that email exists, a password reset link has been sent.' 
    });
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resetData: ResetPasswordDto = req.body;
    await userService.resetPassword(resetData.token, resetData.password);
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    const userId = req.user.id;
    const updateData = req.body;
    const updatedUser = await userService.updateUser(userId, updateData);
    
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
}
