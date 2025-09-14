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

  // Helmet for comprehensive security headers
  middleware.push(helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.spotify.com", "https://accounts.spotify.com"]
      }
    },
    // Disable problematic policies for API usage
    crossOriginEmbedderPolicy: false,
    // Hide server information
    hidePoweredBy: true,
    // Prevent MIME type sniffing
    noSniff: true,
    // Enable XSS protection
    xssFilter: true,
    // Prevent clickjacking
    frameguard: { action: 'deny' },
    // Force HTTPS in production
    hsts: config.NODE_ENV === 'production' ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    } : false,
    // Prevent DNS prefetching
    dnsPrefetchControl: { allow: false },
    // Don't cache sensitive pages
    noCache: false, // Allow caching for API responses
    // Referrer policy
    referrerPolicy: { policy: 'same-origin' }
  }));

  // Cookie parser with secret
  middleware.push(cookieParser(config.SECURITY.COOKIE_SECRET));

  // Custom middleware to remove any remaining server identifying headers
  middleware.push((req, res, next) => {
    // Remove server identifying headers
    res.removeHeader('Server');
    res.removeHeader('X-Powered-By');
    res.removeHeader('X-AspNet-Version');
    res.removeHeader('X-AspNetMvc-Version');
    res.removeHeader('X-Frame-Options'); // Will be set by Helmet instead
    
    // Set custom server header that doesn't reveal technology stack
    res.setHeader('Server', 'Songify-API');
    
    next();
  });

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
