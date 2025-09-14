/**
 * Health Check Controller
 * Handles application health and status endpoints
 */

const config = require('../config/environment');
const { HTTP_STATUS } = require('../constants');
const { codeManager } = require('../utils');

/**
 * Basic health check endpoint
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const healthCheck = (req, res) => {
  try {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      // SECURITY: Remove server identifying information
      // environment: config.NODE_ENV, // Removed to prevent info disclosure
      uptime: Math.floor(process.uptime()), // Rounded to prevent precise timing attacks
      // memory: process.memoryUsage(), // Removed to prevent system info disclosure
      // version: process.version // Removed to prevent Node.js version disclosure
    };

    res.status(HTTP_STATUS.OK).json(healthData);
  } catch (error) {
    console.error('Health check error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Internal server error' // Generic error message
    });
  }
};

/**
 * Detailed system status endpoint
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const systemStatus = (req, res) => {
  try {
    const statusData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      // SECURITY: Remove environment info to prevent disclosure
      // environment: config.NODE_ENV,
      system: {
        uptime: Math.floor(process.uptime()), // Rounded to prevent precise timing
        // SECURITY: Remove detailed system information
        // memory: process.memoryUsage(),
        // cpu: process.cpuUsage(),
        // version: process.version,
        // platform: process.platform,
        // arch: process.arch
        healthy: true // Generic health indicator
      },
      application: {
        name: 'Songify Backend',
        // SECURITY: Remove version to prevent info disclosure
        // version: '1.0.0',
        // port: config.PORT, // Remove port info
        status: 'running'
        // trackedCodes: codeManager.getCodeCount() // Remove internal metrics
      },
      services: {
        spotify: {
          configured: !!(config.SPOTIFY.CLIENT_ID && config.SPOTIFY.CLIENT_SECRET)
          // SECURITY: Remove client ID length info
          // clientIdLength: config.SPOTIFY.CLIENT_ID ? config.SPOTIFY.CLIENT_ID.length : 0
        }
      }
    };

    res.status(HTTP_STATUS.OK).json(statusData);
  } catch (error) {
    console.error('System status error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Internal server error' // Generic error message
    });
  }
};

/**
 * Readiness probe for container orchestration
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const readinessProbe = (req, res) => {
  try {
    // Check if essential services are configured
    const isReady = !!(config.SPOTIFY.CLIENT_ID && config.SPOTIFY.CLIENT_SECRET);

    if (isReady) {
      res.status(HTTP_STATUS.OK).json({
        status: 'READY',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        reason: 'Missing required configuration'
      });
    }
  } catch (error) {
    console.error('Readiness probe error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

/**
 * Liveness probe for container orchestration
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const livenessProbe = (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).json({
      status: 'ALIVE',
      timestamp: new Date().toISOString()
      // SECURITY: Remove uptime to prevent system info disclosure
      // uptime: process.uptime()
    });
  } catch (error) {
    console.error('Liveness probe error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Internal server error' // Generic error message
    });
  }
};

module.exports = {
  healthCheck,
  systemStatus,
  readinessProbe,
  livenessProbe
};
