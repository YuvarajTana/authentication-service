// src/middleware/rateLimiter.ts
import { Application } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import logger from '../utils/logger';

/**
 * Configure and set up rate limiting middleware
 */
export function setupRateLimiting(app: Application): void {
  // Create different rate limiters for different routes/purposes
  
  // 1. Authentication routes limiter - more strict
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 authentication requests per window
    standardHeaders: true,
    legacyHeaders: false, // don't send legacy X-RateLimit headers
    message: 'Too many authentication attempts, please try again after 15 minutes',
    skipSuccessfulRequests: false // count all requests
  });
  
  // 2. API routes general limiter - less strict
  const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 5 minutes',
    skipSuccessfulRequests: true // only count failed requests
  });
  
  // 3. Password reset specific limiter - moderate
  const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many password reset attempts, please try again after an hour',
    skipSuccessfulRequests: false
  });

  // Optional: Use Redis for rate limiting in production
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    try {
      const redisClient = createClient({
        url: process.env.REDIS_URL
      });
      
      redisClient.connect().then(() => {
        logger.info('Redis connected for rate limiting');
        
        // Configure Redis store for authentication limiter
        const authRedisStore = new RedisStore({
          // @ts-ignore - Type issues with the redis client
          sendCommand: (...args: string[]) => redisClient.sendCommand(args),
          prefix: 'ratelimit:auth:'
        });
        
        // Update authentication limiter to use Redis
        // Use type assertion to fix TypeScript error
        (authLimiter as any).store = authRedisStore;
        
        // Similarly, you could update other limiters to use Redis with different prefixes
      }).catch(err => {
        logger.error('Redis connection failed, falling back to memory store', err);
      });
    } catch (error) {
      logger.error('Failed to initialize Redis for rate limiting', error);
    }
  }
  
  // Apply rate limiters to specific routes
  
  // Authentication routes
  app.use('/api/users/login', authLimiter);
  app.use('/api/users/register', authLimiter);
  app.use('/api/users/refresh-token', authLimiter);
  
  // Password reset routes
  app.use('/api/users/forgot-password', passwordResetLimiter);
  app.use('/api/users/reset-password', passwordResetLimiter);
  
  // All other API routes
  app.use('/api', apiLimiter);
  
  logger.info('Rate limiting middleware configured');
}
