// Authentication Endpoints and Usage Examples

/*
This file provides examples for testing the authentication and authorization endpoints
using tools like cURL, Postman, or directly from frontend applications.
*/

// ------ AUTHENTICATION FLOW EXAMPLES ------

// 1. User Registration
// POST /api/auth/register
const registerExample = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/register',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
    passwordConfirmation: 'Password123'
  })
};

// Expected response (status 201):
const registerResponse = {
  user: {
    id: '63f5e9a73c3e3e001d9c4d5b',
    name: 'John Doe',
    email: 'john@example.com',
    isAdmin: false
  },
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  // The refreshToken is set as an HTTP-only cookie
};

// 2. User Login
// POST /api/auth/login
const loginExample = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/login',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'Password123'
  })
};

// Expected response (status 200):
const loginResponse = {
  user: {
    id: '63f5e9a73c3e3e001d9c4d5b',
    name: 'John Doe',
    email: 'john@example.com',
    isAdmin: false
  },
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  // The refreshToken is set as an HTTP-only cookie
};

// 3. Accessing Protected Resources
// GET /api/auth/me
const getProfileExample = {
  method: 'GET',
  url: 'http://localhost:3000/api/auth/me',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
};

// Expected response (status 200):
const profileResponse = {
  user: {
    id: '63f5e9a73c3e3e001d9c4d5b',
    name: 'John Doe',
    email: 'john@example.com',
    isAdmin: false,
    roles: ['user']
  }
};

// 4. Refreshing Access Token
// POST /api/auth/refresh-token
const refreshTokenExample = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/refresh-token',
  headers: {
    'Content-Type': 'application/json'
    // The refresh token is automatically included in the cookies
  },
  // Only needed if the refresh token isn't sent as a cookie
  body: JSON.stringify({
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
};

// Expected response (status 200):
const refreshTokenResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  // The new refreshToken is set as an HTTP-only cookie
};

// 5. Logout
// POST /api/auth/logout
const logoutExample = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/logout',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
};

// Expected response (status 200):
const logoutResponse = {
  message: 'Logged out successfully'
  // The refresh token cookie is cleared
};

// 6. Requesting Password Reset
// POST /api/auth/forgot-password
const forgotPasswordExample = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/forgot-password',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com'
  })
};

// Expected response (status 200):
const forgotPasswordResponse = {
  message: 'If a user with that email exists, a password reset link has been sent.'
};

// 7. Resetting Password
// POST /api/auth/reset-password
const resetPasswordExample = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/reset-password',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    password: 'NewPassword123',
    passwordConfirmation: 'NewPassword123'
  })
};

// Expected response (status 200):
const resetPasswordResponse = {
  message: 'Password has been reset successfully'
};

// ------ AUTHORIZATION EXAMPLES ------

// 1. Accessing Admin-only Resource
// POST /api/products (create a new product - admin only)
const createProductExample = {
  method: 'POST',
  url: 'http://localhost:3000/api/products',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Admin's token
  },
  body: JSON.stringify({
    name: 'Product Name',
    description: 'Product description goes here',
    price: 99.99,
    category: 'electronics'
  })
};

// Expected response (status 201):
const createProductResponse = {
  product: {
    id: '63f5e9a73c3e3e001d9c4d5c',
    name: 'Product Name',
    description: 'Product description goes here',
    price: 99.99,
    category: 'electronics'
  }
};

// Example of unauthorized access (using non-admin token)
// Expected response (status 403):
const unauthorizedResponse = {
  status: 'error',
  message: 'Access denied: Required role(s): admin'
};

// ------ CURL EXAMPLES ------

/*
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123","passwordConfirmation":"Password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}' \
  -c cookies.txt  # Save cookies (including refresh token)

# Get user profile (protected route)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt  # Send cookies

# Refresh token
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -b cookies.txt \  # Send cookies with refresh token
  -c cookies.txt    # Update cookies with new refresh token

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
*/

// ------ FRONTEND IMPLEMENTATION (React Example) ------

/*
// auth.service.js - Auth service for frontend
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
*/