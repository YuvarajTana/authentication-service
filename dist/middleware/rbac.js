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
exports.isResourceOwner = exports.hasPermission = exports.isAdminOrUser = exports.isUser = exports.isAdmin = void 0;
exports.requireRoles = requireRoles;
const authService_1 = require("../services/authService");
const errorHandler_1 = require("../utils/errorHandler");
/**
 * Middleware factory for role-based access control
 * @param requiredRoles Array of roles allowed to access the resource
 */
function requireRoles(requiredRoles) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError('Authentication required', 401);
            }
            const userId = req.user.id;
            // Get user's roles
            const userRoles = yield authService_1.authService.getUserRoles(userId);
            // Check if the user has any of the required roles
            const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
            if (!hasRequiredRole) {
                throw new errorHandler_1.AppError(`Access denied: Required role(s): ${requiredRoles.join(', ')}`, 403);
            }
            // Add roles to request for potential use in controllers
            req.user.roles = userRoles;
            next();
        }
        catch (error) {
            next(error);
        }
    });
}
// Common role check middleware functions
exports.isAdmin = requireRoles(['admin']);
exports.isUser = requireRoles(['user']);
exports.isAdminOrUser = requireRoles(['admin', 'user']);
// Permission-based middleware for finer-grained control
const hasPermission = (permission) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError('Authentication required', 401);
            }
            const userId = req.user.id;
            // For simplicity, we're mapping permissions to roles
            // In a real app, you might have a more complex permission system
            const permissionMap = {
                'create:products': ['admin'],
                'update:products': ['admin'],
                'delete:products': ['admin'],
                'read:products': ['admin', 'user'],
                'read:own-profile': ['admin', 'user'],
                'update:own-profile': ['admin', 'user']
            };
            const requiredRoles = permissionMap[permission] || [];
            const userRoles = yield authService_1.authService.getUserRoles(userId);
            const hasPermission = requiredRoles.some(role => userRoles.includes(role));
            if (!hasPermission) {
                throw new errorHandler_1.AppError(`Access denied: Required permission: ${permission}`, 403);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.hasPermission = hasPermission;
// Resource ownership middleware
const isResourceOwner = (resourceModelFn) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError('Authentication required', 401);
            }
            const userId = req.user.id;
            const userRoles = yield authService_1.authService.getUserRoles(userId);
            // Admins can access any resource
            if (userRoles.includes('admin')) {
                return next();
            }
            // Get the resource
            const resource = yield resourceModelFn(req);
            // Check if resource exists
            if (!resource) {
                throw new errorHandler_1.AppError('Resource not found', 404);
            }
            // Check if user owns the resource
            const isOwner = ((_a = resource.userId) === null || _a === void 0 ? void 0 : _a.toString()) === userId.toString();
            if (!isOwner) {
                throw new errorHandler_1.AppError('Access denied: You do not own this resource', 403);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.isResourceOwner = isResourceOwner;
// User interface is now defined in auth.ts
//# sourceMappingURL=rbac.js.map