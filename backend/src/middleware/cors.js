/**
 * CORS Middleware Configuration
 * Handles Cross-Origin Resource Sharing settings
 */

const cors = require('cors');
const config = require('../config/environment');

/**
 * Configure CORS middleware with environment-specific settings
 * @returns {Function} Configured CORS middleware
 */
const configureCors = () => {
  const corsOptions = {
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400 // 24 hours
  };

  // In development, allow multiple origins
  if (config.NODE_ENV === 'development') {
    corsOptions.origin = [
      config.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
  }

  return cors(corsOptions);
};

module.exports = configureCors;
