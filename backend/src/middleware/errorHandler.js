/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const config = require('../config/environment');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');
const { secureError, sanitizeRequestForLog } = require('../utils/secureLogger');

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  secureError('Global error handler:', {
    error: err,
    request: sanitizeRequestForLog(req),
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = ERROR_MESSAGES.INTERNAL_ERROR;
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    details = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.NOT_AUTHENTICATED;
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = 'External service unavailable';
  } else if (err.response?.status) {
    // Handle axios errors
    statusCode = err.response.status;
    message = err.response.data?.error_description || err.response.data?.error || err.message;
  }

  const errorResponse = {
    success: false,
    error: message,
    ...(details && { details }),
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
};

/**
 * Async error wrapper to catch async errors in route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function that catches errors
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request logging middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const requestData = sanitizeRequestForLog(req);
    console.log(`${requestData.method} ${requestData.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  asyncErrorHandler,
  requestLogger
};
