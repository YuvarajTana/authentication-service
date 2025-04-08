// src/routes/productRoutes.ts
import { Router } from 'express';
import { 
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import { validateRequest, validateParams, validateQuery } from '../middleware/zodValidation';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productQuerySchema
} from '../schemas/productSchemas';

const router = Router();

// Public routes
router.get('/', validateQuery(productQuerySchema), getAllProducts);
router.get('/:id', validateParams(productIdParamSchema), getProductById);

// Protected routes (require authentication)
router.post(
  '/', 
  authenticate, 
  isAdmin, 
  validateRequest(createProductSchema), 
  createProduct
);

router.put(
  '/:id', 
  authenticate, 
  isAdmin, 
  validateParams(productIdParamSchema),
  validateRequest(updateProductSchema), 
  updateProduct
);

router.delete(
  '/:id', 
  authenticate, 
  isAdmin, 
  validateParams(productIdParamSchema),
  deleteProduct
);

export default router;
