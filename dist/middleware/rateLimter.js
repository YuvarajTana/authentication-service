"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRateLimiting = setupRateLimiting;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Configure and set up rate limiting middleware
 */
function setupRateLimiting(app) {
    // Create different rate limiters for different routes/purposes
    // 1. Authentication routes limiter - more strict
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // limit each IP to 10 authentication requests per window
        standardHeaders: true,
        legacyHeaders: false, // don't send legacy X-RateLimit headers
        message: 'Too many authentication attempts, please try again after 15 minutes',
        skipSuccessfulRequests: false // count all requests
    });
    // 2. API routes general limiter - less strict
    const apiLimiter = (0, express_rate_limit_1.default)({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 100, // limit each IP to 100 requests per window
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many requests from this IP, please try again after 5 minutes',
        skipSuccessfulRequests: true // only count failed requests
    });
    // 3. Password reset specific limiter - moderate
    const passwordResetLimiter = (0, express_rate_limit_1.default)({
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
            const redisClient = (0, redis_1.createClient)({
                url: process.env.REDIS_URL
            });
            redisClient.connect().then(() => {
                logger_1.default.info('Redis connected for rate limiting');
                // Configure Redis store for authentication limiter
                const authRedisStore = new rate_limit_redis_1.default({
                    // @ts-ignore - Type issues with the redis client
                    sendCommand: (...args) => redisClient.sendCommand(args),
                    prefix: 'ratelimit:auth:'
                });
                // Update authentication limiter to use Redis
                // Use type assertion to fix TypeScript error
                authLimiter.store = authRedisStore;
                // Similarly, you could update other limiters to use Redis with different prefixes
            }).catch(err => {
                logger_1.default.error('Redis connection failed, falling back to memory store', err);
            });
        }
        catch (error) {
            logger_1.default.error('Failed to initialize Redis for rate limiting', error);
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
    logger_1.default.info('Rate limiting middleware configured');
}
//# sourceMappingURL=rateLimter.js.map