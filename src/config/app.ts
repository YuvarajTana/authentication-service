// 4. App Configuration: src/config/app.ts
import { Application } from 'express';
import userRoutes from '../routes/userRoutes';
// import productRoutes from '../routes/productRoutes';
import { notFoundHandler } from '../middleware/errorMiddleware';

export function setupRoutes(app: Application): void {
  // API routes
  app.use('/api/users', userRoutes);
  // app.use('/api/products', productRoutes);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // Handle 404s
  app.use(notFoundHandler);
}
