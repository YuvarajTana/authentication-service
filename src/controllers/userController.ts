


// 8. User Controller: src/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { UserLoginDto, UserRegistrationDto } from '../types/user.types';
import { AppError } from '../utils/errorHandler';

const userService = new UserService();

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userData: UserRegistrationDto = req.body;
    const result = await userService.registerUser(userData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const loginData: UserLoginDto = req.body;
    const result = await userService.loginUser(loginData);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
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
    const userId = req.user.id;
    const updateData = req.body;
    const updatedUser = await userService.updateUser(userId, updateData);
    
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
}
