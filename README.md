## Project Organization:

/src: Main source code
Separate directories for controllers, models, routes, services, etc.


### Key Components:

Controllers: Handle HTTP requests and responses
Services: Contain business logic
Models: Define data schemas
Routes: Map endpoints to controllers
Middleware: Handle authentication, validation, error handling
Config: Manage application configuration
Utils: Provide helper functions


### Features Included:

User authentication with JWT
MongoDB integration with Mongoose
Error handling middleware
Request validation
Logging with Winston
Security headers with Helmet
API rate limiting


### Development Setup:

TypeScript configuration
NPM scripts for development and production
ESLint for code quality



The structure is modular and scalable, making it easy to add new features or modify existing ones. You can explore the code examples to understand how each component works and how they interact with each other.

### Project Structure
``` JavaScript
 * /
 * ├── src/
 * │   ├── config/
 * │   │   ├── db.ts                  # Database configuration
 * │   │   ├── middleware.ts          # Express middleware setup
 * │   │   └── app.ts                 # Express app configuration
 * │   ├── controllers/
 * │   │   ├── userController.ts      # User-related route handlers
 * │   │   └── productController.ts   # Product-related route handlers
 * │   ├── models/
 * │   │   ├── userModel.ts           # User model definition
 * │   │   └── productModel.ts        # Product model definition
 * │   ├── routes/
 * │   │   ├── userRoutes.ts          # User-related routes
 * │   │   └── productRoutes.ts       # Product-related routes
 * │   ├── services/
 * │   │   ├── userService.ts         # User business logic
 * │   │   └── productService.ts      # Product business logic
 * │   ├── utils/
 * │   │   ├── logger.ts              # Logging utility
 * │   │   ├── errorHandler.ts        # Error handling utility
 * │   │   └── validation.ts          # Input validation utilities
 * │   ├── types/
 * │   │   ├── user.types.ts          # User-related type definitions
 * │   │   └── product.types.ts       # Product-related type definitions
 * │   ├── middleware/
 * │   │   ├── auth.ts                # Authentication middleware
 * │   │   ├── errorMiddleware.ts     # Error handling middleware
 * │   │   └── validation.ts          # Validation middleware
 * │   └── server.ts                  # Entry point for the application
 * ├── .env                           # Environment variables
 * ├── .env.example                   # Example environment variables
 * ├── .gitignore                     # Git ignore file
 * ├── tsconfig.json                  # TypeScript configuration
 * ├── package.json                   # Project dependencies and scripts
 * └── README.md                      # Project documentation
 
```

// RUNNING THE API WITH AUTHENTICATION & AUTHORIZATION
// ====================================================

/*
This guide provides instructions on how to run the Node.js REST API with authentication
and authorization features. The guide covers initial setup, environment configuration,
starting the server, and testing the authentication flow.
*/

// ----- SETUP INSTRUCTIONS -----

// 1. Install dependencies
// Run this in your project root directory
$ npm install

// 2. Set up environment variables
// Create a .env file in the project root with the following content:
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/api

# JWT Settings
ACCESS_TOKEN_SECRET=your-secure-access-token-secret-key
REFRESH_TOKEN_SECRET=your-secure-refresh-token-secret-key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Email Service (for password reset)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-user
EMAIL_PASS=your-mailtrap-password
EMAIL_FROM=noreply@example.com

# Frontend URL (for CORS and email reset links)
FRONTEND_URL=http://localhost:3000

# Optional Redis for rate limiting
# REDIS_URL=redis://localhost:6379

// 3. Create initial admin user (optional)
// Add admin credentials to your .env file
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecureAdminPass123!
ADMIN_NAME=Admin User

// Then run the admin creation script
$ npx ts-node src/scripts/createAdminUser.ts

// 4. Build the application
$ npm run build

// 5. Start the server
// Development mode with auto-reload
$ npm run dev

// Production mode
$ npm start

// ----- TESTING THE AUTHENTICATION FLOW -----

// Here's a step-by-step guide to test the authentication flow with curl.
// You can copy and paste these commands in your terminal.

// 1. Register a new user
$ curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"user@example.com","password":"Password123","passwordConfirmation":"Password123"}' \
  -c cookies.txt \
  -v

// 2. Login with the newly created user
$ curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}' \
  -c cookies.txt \
  -v

// 3. Store the access token
// Extract the access token from the previous response and store it in a variable
// Replace YOUR_ACCESS_TOKEN with the actual token from the response
$ ACCESS_TOKEN=YOUR_ACCESS_TOKEN

// 4. Access a protected route
$ curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -b cookies.txt \
  -v

// 5. Refresh your access token
$ curl -X POST http://localhost:3000/api/auth/refresh-token \
  -b cookies.txt \
  -c cookies.txt \
  -v

// Store the new access token
$ ACCESS_TOKEN=YOUR_NEW_ACCESS_TOKEN

// 6. Logout
$ curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -b cookies.txt \
  -v

// ----- TESTING ROLE-BASED ACCESS CONTROL -----

// First login as admin
$ curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecureAdminPass123!"}' \
  -c admin_cookies.txt

// Store the admin access token
$ ADMIN_TOKEN=YOUR_ADMIN_TOKEN

// Try to access an admin-only route
$ curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -b admin_cookies.txt

// Try the same with a regular user token
$ curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -b cookies.txt

// ----- COMMON ISSUES & TROUBLESHOOTING -----

// 1. MongoDB Connection Issues
// - Make sure MongoDB is running
// - Check the MONGODB_URI in .env
// - Try connecting manually with MongoDB CLI

// 2. JWT Token Issues
// - Ensure ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are set
// - Check token expiry times
// - Verify that authorization header format is: "Bearer <token>"

// 3. Rate Limiting Issues
// - If using Redis, ensure Redis server is running
// - If rate limit is exceeded, wait for the time window to reset

// 4. CORS Issues
// - Check FRONTEND_URL in .env matches your frontend application
// - Ensure credentials: true is set in your frontend fetch/axios calls

// For authentication debugging, enable verbose logging in .env:
LOG_LEVEL=debug

// ----- EXTENDING THE AUTHENTICATION SYSTEM -----

// 1. Adding Social Login (e.g., Google OAuth)
// - Install passport and passport-google-oauth20
// - Create a new service for social authentication
// - Add routes for OAuth callbacks
// - Integrate with the existing token system

// 2. Implementing Two-Factor Authentication
// - Install a 2FA library like speakeasy
// - Add a 2FA field to the User model
// - Create routes for enabling/disabling 2FA
// - Update the authentication flow to check for 2FA

// 3. Adding Role-Based API Documentation
// - Use Swagger with security definitions
// - Document required roles for each endpoint
// - Add authorization scopes for OAuth