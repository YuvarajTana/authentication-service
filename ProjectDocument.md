# Full Auth Service

## Project Overview

Full Auth Service is a comprehensive authentication and authorization service built with Node.js, Express, and TypeScript. It provides a robust, secure, and scalable solution for user authentication, authorization, and user management. The service follows industry best practices for security, including JWT-based authentication, secure password handling, and role-based access control.

## Tech Stack

- **Backend Framework**: Node.js with Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Zod and Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting
- **API Testing**: Jest, Supertest

## Architecture & Design Patterns

The project follows several architectural patterns and design principles:

### MVC Pattern (Modified)
- **Models**: Define data schemas and database interactions
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic (extension of traditional MVC)

### Service Layer Pattern
- Business logic is encapsulated in service classes
- Controllers delegate to services for data processing
- Promotes separation of concerns and testability

### Repository Pattern (Implicit)
- Database operations are abstracted in models
- Services interact with models for data access

### Middleware Pattern
- Request processing pipeline with specialized middleware
- Authentication, validation, error handling as middleware

### Dependency Injection (Manual)
- Services are instantiated and injected where needed
- Promotes testability and loose coupling

## Project Structure

```
/src
├── config/                 # Application configuration
│   ├── app.ts              # Express app configuration
│   ├── db.ts               # Database configuration
│   └── middleware.ts       # Express middleware setup
├── controllers/            # Request handlers
│   ├── authController.ts   # Authentication controllers
│   ├── userController.ts   # User management controllers
│   └── productController.ts # Product controllers
├── middleware/             # Custom middleware
│   ├── auth.ts             # Authentication middleware
│   ├── errorMiddleware.ts  # Error handling middleware
│   ├── rateLimiter.ts      # Rate limiting middleware
│   ├── rbac.ts             # Role-based access control
│   ├── roleCheck.ts        # Role verification
│   ├── validation.ts       # Joi validation middleware
│   └── zodValidation.ts    # Zod validation middleware
├── models/                 # Data models
│   └── userModel.ts        # User model definition
├── routes/                 # API routes
│   ├── authRoutes.ts       # Authentication routes
│   ├── userRoutes.ts       # User management routes
│   └── productRoutes.ts    # Product routes
├── schemas/                # Validation schemas
│   ├── userSchemas.ts      # User-related schemas
│   └── productSchemas.ts   # Product-related schemas
├── services/               # Business logic
│   ├── authService.ts      # Authentication service
│   └── userService.ts      # User management service
├── types/                  # TypeScript type definitions
│   └── user.types.ts       # User-related types
├── utils/                  # Utility functions
│   ├── errorHandler.ts     # Error handling utilities
│   └── logger.ts           # Logging utilities
└── server.ts               # Application entry point
```

## Authentication & Authorization

### Authentication Flow

1. **Registration**: Users register with name, email, and password
2. **Login**: Users authenticate with email and password
3. **Token Generation**: Server issues JWT access token and refresh token
4. **Token Storage**: Access token stored in memory/localStorage, refresh token in HTTP-only cookie
5. **Token Refresh**: Refresh token used to obtain new access token when expired
6. **Logout**: Invalidates refresh token and clears cookie

### Security Features

- **JWT Tokens**: Short-lived access tokens (15 minutes) and longer-lived refresh tokens (7 days)
- **HTTP-Only Cookies**: Refresh tokens stored in secure, HTTP-only cookies
- **Password Hashing**: bcrypt for secure password storage
- **CSRF Protection**: Token-based approach with proper cookie settings
- **Rate Limiting**: Prevents brute force attacks on authentication endpoints
- **Input Validation**: Comprehensive validation using Zod/Joi schemas
- **Security Headers**: Helmet middleware for HTTP security headers

### Role-Based Access Control

- **User Roles**: Basic user and admin roles
- **Permission System**: Role-based permissions for different operations
- **Middleware Protection**: Routes protected based on user roles
- **Resource Ownership**: Users can only access their own resources (unless admin)

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate tokens
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Management Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Admin Endpoints

- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/:id` - Get specific user (admin only)
- `PUT /api/admin/users/:id` - Update user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

## Setup & Installation

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation Steps

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd full_auth_service
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the project root with the following variables:
   ```
   NODE_ENV=development
   PORT=3000
   
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
   ```

4. (Optional) Create an admin user
   Add admin credentials to your `.env` file:
   ```
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=SecureAdminPass123!
   ADMIN_NAME=Admin User
   ```
   
   Then run the admin creation script:
   ```bash
   npx ts-node src/scripts/createAdminUser.ts
   ```

## Running the Project

### Development Mode

```bash
npm run dev
```

This starts the server with nodemon for automatic reloading during development.

### Production Mode

```bash
npm run build
npm start
```

The first command compiles TypeScript to JavaScript, and the second command starts the server using the compiled code.

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality
- `npm test` - Run tests

## Consuming the Service

### Authentication Flow Example

#### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123","passwordConfirmation":"Password123"}' \
  -c cookies.txt
```

Response:
```json
{
  "user": {
    "id": "63f5e9a73c3e3e001d9c4d5b",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}' \
  -c cookies.txt
```

Response:
```json
{
  "user": {
    "id": "63f5e9a73c3e3e001d9c4d5b",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Access Protected Route

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

Response:
```json
{
  "user": {
    "id": "63f5e9a73c3e3e001d9c4d5b",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "roles": ["user"]
  }
}
```

#### 4. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -b cookies.txt \
  -c cookies.txt
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 5. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

### Frontend Integration (React Example)

```javascript
// auth.service.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData, {
      withCredentials: true // Important for cookies
    });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password }, {
      withCredentials: true
    });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    await axios.post(`${API_URL}/logout`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      withCredentials: true
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await axios.post(`${API_URL}/refresh-token`, {}, {
        withCredentials: true
      });
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  // Get auth header
  getAuthHeader: () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default authService;
```

### Axios Interceptor for Token Refresh

```javascript
// axios-interceptor.js
import axios from 'axios';
import authService from './auth.service';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
});

// Request interceptor to add auth header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const { accessToken } = await authService.refreshToken();
        
        // Update the header and retry
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

## Security Considerations

### Best Practices Implemented

1. **Secure Password Storage**: Passwords are hashed using bcrypt with appropriate salt rounds
2. **JWT Security**: Short-lived access tokens with secure refresh token rotation
3. **HTTP-Only Cookies**: Refresh tokens stored in secure, HTTP-only cookies to prevent XSS attacks
4. **CORS Configuration**: Proper CORS settings to prevent cross-origin attacks
5. **Rate Limiting**: Protection against brute force and DoS attacks
6. **Input Validation**: Comprehensive validation to prevent injection attacks
7. **Security Headers**: HTTP security headers via Helmet middleware
8. **Error Handling**: Secure error responses that don't leak sensitive information

### Security Recommendations

1. **HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Keep secrets in environment variables, never in code
3. **Regular Updates**: Keep dependencies updated to patch security vulnerabilities
4. **Audit Logging**: Implement comprehensive audit logging for security events
5. **Security Monitoring**: Set up monitoring for suspicious activities

## Error Handling

The service implements a centralized error handling mechanism:

1. **Custom Error Class**: `AppError` class for application-specific errors
2. **Error Middleware**: Global error handling middleware to process all errors
3. **Standardized Responses**: Consistent error response format
4. **Logging**: All errors are logged for monitoring and debugging

## Testing

### Testing Approach

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API endpoints and database interactions
3. **End-to-End Tests**: Test complete user flows

### Running Tests

```bash
npm test
```

## Extending the Service

### Adding New Features

1. **New Endpoints**: Add new routes in the appropriate route file
2. **New Controllers**: Create controller functions for new endpoints
3. **New Services**: Implement business logic in service classes
4. **New Models**: Define data models for new entities
5. **New Validation**: Create validation schemas for new data structures

### Adding Social Authentication

1. Install required packages:
   ```bash
   npm install passport passport-google-oauth20
   ```

2. Create OAuth configuration and strategies
3. Add new routes for OAuth callbacks
4. Integrate with the existing token system

### Implementing Two-Factor Authentication

1. Install 2FA library:
   ```bash
   npm install speakeasy qrcode
   ```

2. Add 2FA fields to the User model
3. Create routes for enabling/disabling 2FA
4. Update the authentication flow to check for 2FA

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in .env
   - Try connecting manually with MongoDB CLI

2. **JWT Token Issues**
   - Ensure ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are set
   - Check token expiry times
   - Verify that authorization header format is: "Bearer <token>"

3. **Rate Limiting Issues**
   - If using Redis, ensure Redis server is running
   - If rate limit is exceeded, wait for the time window to reset

4. **CORS Issues**
   - Check FRONTEND_URL in .env matches your frontend application
   - Ensure credentials: true is set in your frontend fetch/axios calls

### Debugging

Enable verbose logging in .env:
```
LOG_LEVEL=debug
```

## Conclusion

The Full Auth Service provides a robust, secure, and scalable solution for authentication and authorization. It follows industry best practices and can be easily integrated with various frontend applications. The service is designed to be extensible, allowing for the addition of new features and customization to meet specific requirements.
