"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
    logger_1.default.error(err);
    // Handle AppError instances
    if (err instanceof errorHandler_1.AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
        return;
    }
    // Handle validation errors
    if (err.name === 'ValidationError') {
        res.status(400).json({
            status: 'error',
            message: 'Validation Error',
            errors: err
        });
        return;
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
        return;
    }
    // Handle other errors
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
    });
}
/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({
        status: 'error',
        message: `Route not found: ${req.originalUrl}`
    });
}
//# sourceMappingURL=errorMiddleware.js.map