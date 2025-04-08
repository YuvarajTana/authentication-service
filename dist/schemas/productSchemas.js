"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productQuerySchema = exports.productIdParamSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
// src/schemas/productSchemas.ts
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
// Validate MongoDB ObjectId
const objectIdSchema = zod_1.z.string().refine(val => mongoose_1.Types.ObjectId.isValid(val), { message: 'Invalid ID format' });
/**
 * Product creation schema
 */
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, 'Product name must be at least 2 characters long')
        .max(100, 'Product name cannot exceed 100 characters'),
    description: zod_1.z.string()
        .min(10, 'Description must be at least 10 characters long')
        .max(1000, 'Description cannot exceed 1000 characters'),
    price: zod_1.z.number()
        .positive('Price must be positive')
        .min(0.01, 'Price must be at least 0.01'),
    category: zod_1.z.string()
        .min(2, 'Category must be at least 2 characters long'),
    inStock: zod_1.z.boolean().default(true),
    imageUrl: zod_1.z.string()
        .url('Invalid image URL format')
        .optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
/**
 * Product update schema - similar to create but all fields optional
 */
exports.updateProductSchema = exports.createProductSchema.partial();
/**
 * Schema for ID parameter validation
 */
exports.productIdParamSchema = zod_1.z.object({
    id: objectIdSchema
});
/**
 * Schema for query parameters
 */
exports.productQuerySchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    minPrice: zod_1.z.string().optional().transform(val => val ? Number(val) : undefined),
    maxPrice: zod_1.z.string().optional().transform(val => val ? Number(val) : undefined),
    sort: zod_1.z.enum(['price_asc', 'price_desc', 'newest', 'name_asc']).optional(),
    page: zod_1.z.string().optional().transform(val => val ? Number(val) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? Number(val) : 10),
    search: zod_1.z.string().optional(),
}).refine(data => {
    // If minPrice and maxPrice are provided, ensure minPrice <= maxPrice
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
    }
    return true;
}, {
    message: 'Minimum price must be less than or equal to maximum price',
    path: ['minPrice', 'maxPrice']
});
//# sourceMappingURL=productSchemas.js.map