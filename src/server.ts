// src/server.ts - Entry point for the application
import 'dotenv/config';
import express from 'express';
import { setupMiddleware } from './config/middleware';
import { setupRoutes } from './config/app';
import { connectDB } from './config/db';
import logger from './utils/logger';

async function startServer() {
  try {
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Connect to database
    await connectDB();
    logger.info('Connected to database');

    // Setup middleware
    setupMiddleware(app);
    logger.info('Middleware configured');

    // Setup routes
    setupRoutes(app);
    logger.info('Routes configured');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start the application
startServer();
