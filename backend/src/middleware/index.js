/**
 * Middleware barrel file - exports all middleware
 */

const configureCors = require('./cors');
const { validateAccessToken, validateTokenAndUser, requireRefreshToken } = require('./auth');
const { globalErrorHandler, notFoundHandler, asyncErrorHandler, requestLogger } = require('./errorHandler');
const { configureSecurityMiddleware, configureRateLimit } = require('./security');

module.exports = {
  // CORS
  configureCors,
  
  // Authentication
  validateAccessToken,
  validateTokenAndUser,
  requireRefreshToken,
  
  // Error Handling
  globalErrorHandler,
  notFoundHandler,
  asyncErrorHandler,
  requestLogger,
  
  // Security
  configureSecurityMiddleware,
  configureRateLimit
};
