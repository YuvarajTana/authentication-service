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
// scripts/createAdminUser.ts - Script to create an admin user
require("dotenv/config");
const db_1 = require("../config/db");
const userModel_1 = __importDefault(require("../models/userModel"));
const logger_1 = __importDefault(require("../utils/logger"));
function createAdminUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, db_1.connectDB)();
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
            const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
            const adminName = process.env.ADMIN_NAME || 'Admin User';
            // Check if admin already exists
            const existingAdmin = yield userModel_1.default.findOne({ email: adminEmail });
            if (existingAdmin) {
                logger_1.default.info(`Admin user already exists with email: ${adminEmail}`);
                process.exit(0);
            }
            // Create new admin user
            const adminUser = new userModel_1.default({
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                isAdmin: true
            });
            yield adminUser.save();
            logger_1.default.info(`Admin user created with email: ${adminEmail}`);
            process.exit(0);
        }
        catch (error) {
            logger_1.default.error('Failed to create admin user', error);
            process.exit(1);
        }
    });
}
createAdminUser();
//# sourceMappingURL=createAdminUser.js.map