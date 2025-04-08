"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateRequest = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("../utils/errorHandler");
/**
 * Generic validation middleware factory using Zod
 * This middleware validates the request body against a provided Zod schema
 */
const validateRequest = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Parse and validate the request body
            yield schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            // Handle Zod validation errors
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }));
                next(new errorHandler_1.AppError(`Validation error: ${formattedErrors.map(e => `${e.path}: ${e.message}`).join(', ')}`, 400));
            }
            else {
                next(error);
            }
        }
    });
};
exports.validateRequest = validateRequest;
// You can also add specialized middleware for validating query parameters, path parameters, etc.
const validateQuery = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield schema.parseAsync(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }));
                next(new errorHandler_1.AppError(`Query validation error: ${formattedErrors.map(e => `${e.path}: ${e.message}`).join(', ')}`, 400));
            }
            else {
                next(error);
            }
        }
    });
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield schema.parseAsync(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }));
                next(new errorHandler_1.AppError(`Path parameter validation error: ${formattedErrors.map(e => `${e.path}: ${e.message}`).join(', ')}`, 400));
            }
            else {
                next(error);
            }
        }
    });
};
exports.validateParams = validateParams;
//# sourceMappingURL=zodValidation.js.map