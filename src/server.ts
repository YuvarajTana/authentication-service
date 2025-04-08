// 1. Entry point: src/server.ts
import express from 'express';
import { setupMiddleware } from './config/middleware';
import { setupRoutes } from './config/app';
import { connectDB } from './config/db';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup middleware
setupMiddleware(app);

// Setup routes
setupRoutes(app);

// Connect to database
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to connect to the database', error);
    process.exit(1);
  });
