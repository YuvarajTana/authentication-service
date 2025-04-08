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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts - Entry point for the application
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const middleware_1 = require("./config/middleware");
const app_1 = require("./config/app");
const db_1 = require("./config/db");
const logger_1 = __importDefault(require("./utils/logger"));
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const app = (0, express_1.default)();
            const PORT = process.env.PORT || 3000;
            // Connect to database
            yield (0, db_1.connectDB)();
            logger_1.default.info('Connected to database');
            // Setup middleware
            (0, middleware_1.setupMiddleware)(app);
            logger_1.default.info('Middleware configured');
            // Setup routes
            (0, app_1.setupRoutes)(app);
            logger_1.default.info('Routes configured');
            // Start server
            app.listen(PORT, () => {
                logger_1.default.info(`Server running on port ${PORT}`);
                logger_1.default.info(`API available at http://localhost:${PORT}/api`);
            });
        }
        catch (error) {
            logger_1.default.error('Failed to start server', error);
            process.exit(1);
        }
    });
}
// Start the application
startServer();
//# sourceMappingURL=server.js.map