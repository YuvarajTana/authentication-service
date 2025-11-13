// 5. User Model: src/models/userModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../types/user.types';

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  // Email verification fields
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
  },
  // Account security fields
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  accountLockedUntil: {
    type: Date,
    default: null,
  },
  lastLoginAttempt: {
    type: Date,
    default: null,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  lastLoginIp: {
    type: String,
    default: null,
  },
  // Password security
  passwordChangedAt: {
    type: Date,
    default: null,
  },
  passwordHistory: [{
    hash: String,
    changedAt: Date,
  }],
  // User metadata
  publicMetadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {},
  },
  privateMetadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser & Document>('User', userSchema);

export default User;