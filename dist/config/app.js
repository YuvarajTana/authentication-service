"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
// import productRoutes from '../routes/productRoutes';
const errorMiddleware_1 = require("../middleware/errorMiddleware");
function setupRoutes(app) {
    // API routes
    app.use('/api/users', userRoutes_1.default);
    // app.use('/api/products', productRoutes);
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });
    // Handle 404s
    app.use(errorMiddleware_1.notFoundHandler);
}
//# sourceMappingURL=app.js.map