"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 7. User Routes: src/routes/userRoutes.ts
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Auth routes
router.post('/register', validation_1.validateUserRegistration, userController_1.register);
router.post('/login', validation_1.validateUserLogin, userController_1.login);
router.post('/refresh-token', validation_1.validateRefreshToken, userController_1.refreshToken);
router.post('/logout', auth_1.authenticate, userController_1.logout);
// Password reset routes
router.post('/forgot-password', validation_1.validateResetPasswordRequest, userController_1.requestPasswordReset);
router.post('/reset-password', validation_1.validateResetPassword, userController_1.resetPassword);
// User profile routes
router.get('/profile', auth_1.authenticate, userController_1.getProfile);
router.put('/profile', auth_1.authenticate, userController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map