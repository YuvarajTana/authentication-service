# Authentication Service

Enterprise-grade authentication and authorization service built with Node.js, TypeScript, and Express. This service provides secure user authentication, role-based access control, and comprehensive security features.

## Features

### Authentication & Security
- **JWT Authentication**: Access and refresh token system
- **Email Verification**: Secure token-based email verification with 24-hour validity
- **Account Lockout Protection**: Brute force protection (5 failed attempts = 30-minute lockout)
- **Advanced Password Policies**:
  - Minimum 8 characters with complexity requirements
  - Password history tracking (prevents reuse of last 5 passwords)
  - Common/weak password detection
- **Password Reset**: Secure email-based password recovery
- **IP Tracking**: Security logging and monitoring

### User Management
- User registration and login
- Email verification workflow with resend capability
- Role-based access control (RBAC)
- Flexible user metadata (public/private fields)
- Profile management

### Technical Features
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod schemas for request validation
- **Email Service**: HTML email templates with Nodemailer
- **Logging**: Structured logging with Winston
- **Security Headers**: Helmet.js integration
- **Rate Limiting**: Redis-based API rate limiting
- **Error Handling**: Comprehensive error middleware
- **TypeScript**: Full type safety

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache**: Redis (optional, for rate limiting)
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Email**: Nodemailer
- **Logging**: Winston
- **Security**: Helmet, bcrypt

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Redis (optional, for rate limiting)
- SMTP server or email service (e.g., Mailtrap, SendGrid)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd authentication-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/auth-service

   # JWT Configuration
   ACCESS_TOKEN_SECRET=your-secure-access-token-secret-key-change-this
   REFRESH_TOKEN_SECRET=your-secure-refresh-token-secret-key-change-this
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d

   # Email Service
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your-mailtrap-user
   EMAIL_PASS=your-mailtrap-password
   EMAIL_FROM=noreply@example.com

   # Frontend URL (for CORS and email links)
   FRONTEND_URL=http://localhost:3000

   # Redis (Optional - for rate limiting)
   REDIS_URL=redis://localhost:6379

   # Logging
   LOG_LEVEL=info

   # Admin User (Optional - for initial setup)
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=SecureAdmin123!@#
   ADMIN_NAME=Admin User
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Create admin user (optional)**
   ```bash
   npx ts-node src/scripts/createAdminUser.ts
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "passwordConfirmation": "SecurePass123!"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

#### Resend Verification Email
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access-token>
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Cookie: refreshToken=<refresh-token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

#### Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!",
  "passwordConfirmation": "NewSecurePass123!"
}
```

### Protected Routes Example

#### Get All Users (Admin Only)
```http
GET /api/admin/users
Authorization: Bearer <admin-access-token>
```

## Project Structure

```
authentication-service/
├── src/
│   ├── config/
│   │   ├── app.ts              # Express app configuration
│   │   ├── db.ts               # Database connection
│   │   └── middleware.ts       # Middleware setup
│   ├── controllers/
│   │   ├── authController.ts   # Authentication handlers
│   │   ├── userController.ts   # User management handlers
│   │   └── productController.ts
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication middleware
│   │   ├── rbac.ts             # Role-based access control
│   │   ├── errorMiddleware.ts  # Error handling
│   │   ├── validation.ts       # Request validation
│   │   ├── zodValidation.ts    # Zod schema validation
│   │   └── rateLimiter.ts      # Rate limiting
│   ├── models/
│   │   └── userModel.ts        # User schema and model
│   ├── routes/
│   │   ├── authRoutes.ts       # Authentication routes
│   │   ├── userRoutes.ts       # User routes
│   │   └── productRoutes.ts    # Product routes
│   ├── schemas/
│   │   ├── userSchemas.ts      # User validation schemas
│   │   └── productSchemas.ts   # Product validation schemas
│   ├── services/
│   │   ├── authService.ts      # Authentication business logic
│   │   ├── userService.ts      # User business logic
│   │   ├── emailService.ts     # Email sending service
│   │   └── securityService.ts  # Security utilities
│   ├── types/
│   │   └── user.types.ts       # TypeScript type definitions
│   ├── utils/
│   │   ├── errorHandler.ts     # Error handling utilities
│   │   └── logger.ts           # Winston logger setup
│   ├── scripts/
│   │   └── createAdminUser.ts  # Admin user creation script
│   └── server.ts               # Application entry point
├── dist/                       # Compiled JavaScript output
├── .env                        # Environment variables
├── .env.example                # Example environment file
├── .gitignore
├── package.json
├── tsconfig.json               # TypeScript configuration
└── README.md
```

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot be a common/weak password
- Cannot reuse last 5 passwords

### Account Lockout
- Maximum 5 failed login attempts
- 30-minute lockout period
- Email notification on lockout
- IP address tracking
- Automatic unlock after timeout

### Token Security
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Secure HTTP-only cookies for refresh tokens
- Token rotation on refresh
- Blacklist support for logout

### Email Verification
- Secure random token generation
- 24-hour token validity
- Resend capability with rate limiting
- Welcome email after verification

## Testing the API

### Using cURL

1. **Register a new user**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"Password123!","passwordConfirmation":"Password123!"}' \
     -c cookies.txt -v
   ```

2. **Verify email** (use token from email)
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-email \
     -H "Content-Type: application/json" \
     -d '{"token":"YOUR_VERIFICATION_TOKEN"}' -v
   ```

3. **Login**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Password123!"}' \
     -c cookies.txt -v
   ```

4. **Access protected route**
   ```bash
   curl -X GET http://localhost:3000/api/auth/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -b cookies.txt -v
   ```

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables for `baseUrl` and `accessToken`
3. Use the authentication endpoints to get tokens
4. Test protected routes with the Bearer token

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongosh` or `mongo`
- Verify `MONGODB_URI` in `.env`
- Check network connectivity and firewall settings

### JWT Token Issues
- Verify `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are set
- Check token expiry settings
- Ensure Authorization header format: `Bearer <token>`

### Email Not Sending
- Verify SMTP credentials in `.env`
- Check email service logs
- Test with a service like Mailtrap for development

### Rate Limiting Issues
- Ensure Redis is running if using Redis-based rate limiting
- Check `REDIS_URL` configuration
- Adjust rate limit settings in middleware

### Common Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Development

### Code Quality
```bash
# Run linter
npm run lint

# Run tests
npm test

# Build TypeScript
npm run build
```

### Adding New Features

1. **New Routes**: Add to appropriate route file in `src/routes/`
2. **Controllers**: Add handlers in `src/controllers/`
3. **Services**: Add business logic in `src/services/`
4. **Models**: Define schemas in `src/models/`
5. **Validation**: Add schemas in `src/schemas/`
6. **Middleware**: Add custom middleware in `src/middleware/`

## Future Enhancements

- [ ] Social authentication (Google, GitHub, etc.)
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 server capabilities
- [ ] API documentation with Swagger/OpenAPI
- [ ] Comprehensive test suite
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Session management
- [ ] Audit logging
- [ ] Advanced RBAC with permissions

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue in the repository.
