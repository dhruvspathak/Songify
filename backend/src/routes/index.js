/**
 * Routes barrel file - exports all routes
 */

const express = require('express');
const authRoutes = require('./auth');
const healthRoutes = require('./health');

const router = express.Router();

/**
 * Mount all route modules
 */
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Songify Backend API',
    // SECURITY: Remove version information to prevent information disclosure
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/auth',
      health: '/health'
    }
  });
});

module.exports = router;
