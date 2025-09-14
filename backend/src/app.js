/**
 * Express Application Configuration
 * Configures and exports the Express app instance
 */

const express = require('express');
const config = require('./config/environment');
const routes = require('./routes');
const {
  configureCors,
  configureSecurityMiddleware,
  configureRateLimit,
  globalErrorHandler,
  notFoundHandler,
  requestLogger
} = require('./middleware');

/**
 * Create and configure Express application
 * @returns {object} Configured Express app
 */
const createApp = () => {
  const app = express();

  // Request logging (in development)
  if (config.NODE_ENV === 'development') {
    app.use(requestLogger);
  }

  // Security middleware
  const securityMiddleware = configureSecurityMiddleware();
  securityMiddleware.forEach(middleware => app.use(middleware));

  // CORS configuration
  app.use(configureCors());

  // Rate limiting
  app.use(configureRateLimit());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API routes
  app.use('/api', routes);
  
  // Legacy routes (for backward compatibility)
  app.use('/', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  return app;
};

module.exports = createApp;
