"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
// 11. Error Handling Utilities: src/utils/errorHandler.ts
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=errorHandler.js.map