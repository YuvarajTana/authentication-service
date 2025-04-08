
// 9. User Service: src/services/userService.ts
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { UserLoginDto, UserRegistrationDto, AuthResponse } from '../types/user.types';
import { AppError } from '../utils/errorHandler';

export class UserService {
  async registerUser(userData: UserRegistrationDto): Promise<AuthResponse> {
    const { email } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }
    
    // Create new user
    const user = new User(userData);
    await user.save();
    
    // Generate token
    const token = this.generateToken(user._id);
    
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      },
      token
    };
  }
  
  async loginUser(loginData: UserLoginDto): Promise<AuthResponse> {
    const { email, password } = loginData;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Generate token
    const token = this.generateToken(user._id);
    
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      },
      token
    };
  }
  
  async getUserById(userId: string) {
    return User.findById(userId).select('-password');
  }
  
  async updateUser(userId: string, updateData: Partial<UserRegistrationDto>) {
    return User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
  }
  
  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.sign({ id: userId }, secret, { expiresIn: '1d' });
  }
}
