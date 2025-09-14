/**
 * Security Middleware
 * Handles security-related middleware configuration
 */

const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const config = require('../config/environment');

/**
 * Configure security middleware
 * @returns {Array} Array of security middleware functions
 */
const configureSecurityMiddleware = () => {
  const middleware = [];

  // Helmet for security headers
  middleware.push(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.spotify.com", "https://accounts.spotify.com"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // Cookie parser with secret
  middleware.push(cookieParser(config.SECURITY.COOKIE_SECRET));

  return middleware;
};

/**
 * Rate limiting middleware (placeholder for future implementation)
 * @returns {Function} Rate limiting middleware
 */
const configureRateLimit = () => {
  // Placeholder for rate limiting implementation
  // Could use express-rate-limit package
  return (req, res, next) => {
    // Basic rate limiting logic could go here
    next();
  };
};

module.exports = {
  configureSecurityMiddleware,
  configureRateLimit
};
