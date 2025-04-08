// 9. User Service: src/services/userService.ts
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/userModel';
import { 
  UserLoginDto, 
  UserRegistrationDto, 
  AuthResponse, 
  TokenPayload,
  RefreshTokenDto,
  IUser
} from '../types/user.types';
import { AppError } from '../utils/errorHandler';
// import { sendPasswordResetEmail } from '../utils/emailService'; Todo

export class UserService {
  private readonly ACCESS_TOKEN_EXPIRY: string = '15m';
  private readonly REFRESH_TOKEN_EXPIRY: string = '7d';
  private readonly ACCESS_TOKEN_SECRET: jwt.Secret = process.env.ACCESS_TOKEN_SECRET || 'access-token-secret';
  private readonly REFRESH_TOKEN_SECRET: jwt.Secret = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret';
  
  async registerUser(userData: UserRegistrationDto): Promise<AuthResponse> {
    const { email } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }
    
    // Create new user
    const user = new User(userData);
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    
    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();
    
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      },
      accessToken,
      refreshToken
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
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    
    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();
    
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      },
      accessToken,
      refreshToken
    };
  }
  
  async refreshAccessToken(refreshTokenData: RefreshTokenDto): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenData;
    
    // Verify refresh token
    try {
      const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as TokenPayload;
      
      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type', 401);
      }
      
      // Check if user exists and token matches
      const user = await User.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }
      
      // Generate new access token
      const accessToken = this.generateAccessToken(user._id);
      
      return { accessToken };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }
  
  async logoutUser(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
  
  async requestPasswordReset(email: string): Promise<void> {
    const user = await User.findOne({ email });
    
    // If user doesn't exist, just return (don't expose this information)
    if (!user) return;
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and save to user
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    
    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetUrl);
    
  }
  
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Hash token to compare with stored hash
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with this token and check if it's not expired
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      throw new AppError('Password reset token is invalid or has expired', 400);
    }
    
    // Update password and clear reset token fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined; // Invalidate all sessions
    await user.save();
  }
  
  async getUserById(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
    return user as IUser | null;
  }
  
  async updateUser(userId: string, updateData: Partial<UserRegistrationDto>): Promise<IUser | null> {
    // Prevent updating sensitive fields
    const safeUpdateData = { ...updateData };
    delete safeUpdateData.password;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: safeUpdateData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
    
    return updatedUser as IUser | null;
  }
  
  private generateAccessToken(userId: string): string {
    const payload: TokenPayload = {
      id: userId.toString(),
      type: 'access'
    };
    
    const options: SignOptions = { 
      expiresIn: this.ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn']
    };
    
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET as Secret, options);
  }
  
  private generateRefreshToken(userId: string): string {
    const payload: TokenPayload = {
      id: userId.toString(),
      type: 'refresh'
    };
    
    const options: SignOptions = { 
      expiresIn: this.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn']
    };
    
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET as Secret, options);
  }
}
