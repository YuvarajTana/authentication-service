"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMiddleware = setupMiddleware;
// 3. Middleware Configuration: src/config/middleware.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorMiddleware_1 = require("../middleware/errorMiddleware");
function setupMiddleware(app) {
    // Parse JSON bodies
    app.use(express_1.default.json());
    // Parse URL-encoded bodies
    app.use(express_1.default.urlencoded({ extended: true }));
    // Parse cookies
    app.use((0, cookie_parser_1.default)());
    // Enable CORS with credentials
    app.use((0, cors_1.default)({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }));
    // Security headers
    app.use((0, helmet_1.default)());
    // Request logging
    app.use((0, morgan_1.default)('dev'));
    // Rate limiting
    const apiLimiter = (0, express_rate_limit_1.default)({
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
    app.use(errorMiddleware_1.errorHandler);
}
//# sourceMappingURL=middleware.js.map