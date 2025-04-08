"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/productRoutes.ts
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const roleCheck_1 = require("../middleware/roleCheck");
const zodValidation_1 = require("../middleware/zodValidation");
const productSchemas_1 = require("../schemas/productSchemas");
const router = (0, express_1.Router)();
// Public routes
router.get('/', (0, zodValidation_1.validateQuery)(productSchemas_1.productQuerySchema), productController_1.getAllProducts);
router.get('/:id', (0, zodValidation_1.validateParams)(productSchemas_1.productIdParamSchema), productController_1.getProductById);
// Protected routes (require authentication)
router.post('/', auth_1.authenticate, roleCheck_1.isAdmin, (0, zodValidation_1.validateRequest)(productSchemas_1.createProductSchema), productController_1.createProduct);
router.put('/:id', auth_1.authenticate, roleCheck_1.isAdmin, (0, zodValidation_1.validateParams)(productSchemas_1.productIdParamSchema), (0, zodValidation_1.validateRequest)(productSchemas_1.updateProductSchema), productController_1.updateProduct);
router.delete('/:id', auth_1.authenticate, roleCheck_1.isAdmin, (0, zodValidation_1.validateParams)(productSchemas_1.productIdParamSchema), productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map