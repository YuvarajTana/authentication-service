// 3. Middleware Configuration: src/config/middleware.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from '../middleware/errorMiddleware';

export function setupMiddleware(app: Application): void {
  // Parse JSON bodies
  app.use(express.json());
  
  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));
  
  // Enable CORS
  app.use(cors());
  
  // Security headers
  app.use(helmet());
  
  // Request logging
  app.use(morgan('dev'));
  
  // Error handling middleware (should be last)
  app.use(errorHandler);
}