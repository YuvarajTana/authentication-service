// 2. Database Configuration: src/config/db.ts
import mongoose from 'mongoose';
import logger from '../utils/logger';

export async function connectDB(): Promise<void> {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';
    await mongoose.connect(dbUri);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}