// 3. Middleware Configuration: src/config/middleware.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler } from '../middleware/errorMiddleware';

export function setupMiddleware(app: Application): void {
  // Parse JSON bodies
  app.use(express.json());
  
  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));
  
  // Parse cookies
  app.use(cookieParser());
  
  // Enable CORS with credentials
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
  
  // Security headers
  app.use(helmet());
  
  // Request logging
  app.use(morgan('dev'));
  
  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });
  
  // Apply rate limiting to authentication routes
  app.use('/api/users/login', apiLimiter);
  app.use('/api/users/register', apiLimiter);
  app.use('/api/users/forgot-password', apiLimiter);
  app.use('/api/users/reset-password', apiLimiter);
  
  // Error handling middleware (should be last)
  app.use(errorHandler);
}
