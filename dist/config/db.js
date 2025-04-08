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
exports.connectDB = connectDB;
// 2. Database Configuration: src/config/db.ts
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';
            yield mongoose_1.default.connect(dbUri);
            logger_1.default.info('Connected to MongoDB');
        }
        catch (error) {
            logger_1.default.error('MongoDB connection error:', error);
            throw error;
        }
    });
}
//# sourceMappingURL=db.js.map