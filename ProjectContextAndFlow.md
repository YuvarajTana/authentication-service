/**
 * MIDDLEWARE APPLICATION FLOW
 * ==========================
 * 
 * This diagram illustrates how middleware is applied in the Express application.
 * It shows the sequence in which middleware is executed for each request.
 * 
 * Request Flow: Client → Express Server → Response
 * 
 * │
 * ▼
 * 1. express.json()                   # Parse JSON request bodies
 * │
 * ▼
 * 2. express.urlencoded()             # Parse URL-encoded request bodies
 * │
 * ▼
 * 3. cookieParser()                   # Parse cookies
 * │
 * ▼
 * 4. cors()                           # Handle CORS
 * │
 * ▼
 * 5. helmet()                         # Apply security headers
 * │
 * ▼
 * 6. morgan()                         # Log requests
 * │
 * ▼
 * 7. Rate Limiting Middleware         # Apply rate limits based on route
 *    │
 *    ├── authLimiter                  # For authentication routes
 *    │   (10 requests / 15 minutes)
 *    │
 *    ├── passwordResetLimiter         # For password reset routes
 *    │   (3 requests / hour)
 *    │
 *    └── apiLimiter                   # For other API routes
 *        (100 requests / 5 minutes)
 * │
 * ▼
 * 8. Specific Route Processing
 *    │
 *    ├── Authentication Middleware    # Verify user is authenticated (when required)
 *    │
 *    ├── Role Check Middleware        # Verify user has required role (when required)
 *    │
 *    └── Zod Request Validation       # Validate request data using Zod schemas
 *        │
 *        ├── validateRequest()        # Validate request body
 *        │   │
 *        │   └── userRegistrationSchema, userLoginSchema, etc.
 *        │
 *        ├── validateQuery()          # Validate query parameters
 *        │   │
 *        │   └── productQuerySchema, etc.
 *        │
 *        └── validateParams()         # Validate route parameters
 *            │
 *            └── productIdParamSchema, etc.
 * │
 * ▼
 * 9. Route Handler / Controller        # Process the specific request
 * │
 * ▼
 * 10. errorHandler Middleware         # Handle any errors that occurred
 * │
 * ▼
 * Response sent back to client
 * 
 * 
 * TYPICAL REQUEST FLOW EXAMPLES:
 * =============================
 * 
 * Example 1: User Registration
 * ---------------------------
 * POST /api/users/register
 * 
 * 1. express.json()                   # Parse the JSON request body
 * 2. express.urlencoded()             # Skip (not a form submission)
 * 3. cookieParser()                   # Parse any cookies sent
 * 4. cors()                           # Check CORS permissions
 * 5. helmet()                         # Apply security headers
 * 6. morgan()                         # Log the request
 * 7. authLimiter                      # Check if rate limit is exceeded
 * 8. validateRequest(userRegistrationSchema) # Validate registration data
 * 9. register controller              # Process the registration
 * 10. errorHandler                    # Handle any errors
 * 
 * Example 2: Fetch Products with Filtering
 * --------------------------------------
 * GET /api/products?category=electronics&minPrice=50&maxPrice=200
 * 
 * 1. express.json()                   # Skip (no request body)
 * 2. express.urlencoded()             # Skip (not a form submission)
 * 3. cookieParser()                   # Parse any cookies sent
 * 4. cors()                           # Check CORS permissions
 * 5. helmet()                         # Apply security headers
 * 6. morgan()                         # Log the request
 * 7. apiLimiter                       # Check if API rate limit is exceeded
 * 8. validateQuery(productQuerySchema) # Validate query parameters
 * 9. getAllProducts controller        # Process the product search
 * 10. errorHandler                    # Handle any errors
 * 
 * Example 3: Create New Product (Admin Only)
 * ----------------------------------------
 * POST /api/products
 * 
 * 1. express.json()                   # Parse the JSON request body
 * 2. express.urlencoded()             # Skip (not a form submission)
 * 3. cookieParser()                   # Parse any cookies sent
 * 4. cors()                           # Check CORS permissions
 * 5. helmet()                         # Apply security headers
 * 6. morgan()                         # Log the request
 * 7. apiLimiter                       # Check if API rate limit is exceeded
 * 8. authenticate                     # Verify user is authenticated
 * 9. isAdmin                          # Verify user has admin role
 * 10. validateRequest(createProductSchema) # Validate product data
 * 11. createProduct controller        # Process the product creation
 * 12. errorHandler                    # Handle any errors
 * 
 * Example 4: Password Reset Request
 * -------------------------------
 * POST /api/users/forgot-password
 * 
 * 1. express.json()                   # Parse the JSON request body
 * 2. express.urlencoded()             # Skip (not a form submission)
 * 3. cookieParser()                   # Parse any cookies sent
 * 4. cors()                           # Check CORS permissions
 * 5. helmet()                         # Apply security headers
 * 6. morgan()                         # Log the request
 * 7. passwordResetLimiter             # Check if password reset rate limit is exceeded
 * 8. validateRequest(resetPasswordRequestSchema) # Validate email data
 * 9. requestPasswordReset controller  # Process the password reset request
 * 10. errorHandler                    # Handle any errors
 */