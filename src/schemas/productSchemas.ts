// src/schemas/productSchemas.ts
import { z } from 'zod';
import { Types } from 'mongoose';

// Validate MongoDB ObjectId
const objectIdSchema = z.string().refine(
  val => Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

/**
 * Product creation schema
 */
export const createProductSchema = z.object({
  name: z.string()
    .min(2, 'Product name must be at least 2 characters long')
    .max(100, 'Product name cannot exceed 100 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters long')
    .max(1000, 'Description cannot exceed 1000 characters'),
  
  price: z.number()
    .positive('Price must be positive')
    .min(0.01, 'Price must be at least 0.01'),
  
  category: z.string()
    .min(2, 'Category must be at least 2 characters long'),
  
  inStock: z.boolean().default(true),
  
  imageUrl: z.string()
    .url('Invalid image URL format')
    .optional(),
    
  tags: z.array(z.string()).optional(),
});

/**
 * Product update schema - similar to create but all fields optional
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Schema for ID parameter validation
 */
export const productIdParamSchema = z.object({
  id: objectIdSchema
});

/**
 * Schema for query parameters
 */
export const productQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'name_asc']).optional(),
  page: z.string().optional().transform(val => val ? Number(val) : 1),
  limit: z.string().optional().transform(val => val ? Number(val) : 10),
  search: z.string().optional(),
}).refine(
  data => {
    // If minPrice and maxPrice are provided, ensure minPrice <= maxPrice
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: 'Minimum price must be less than or equal to maximum price',
    path: ['minPrice', 'maxPrice']
  }
);
