/**
 * Health Check Routes
 * Defines all health and status endpoints
 */

const express = require('express');
const { healthController } = require('../controllers');
const { asyncErrorHandler } = require('../middleware');

const router = express.Router();

/**
 * @route   GET /health
 * @desc    Basic health check endpoint
 * @access  Public
 */
router.get('/', asyncErrorHandler(healthController.healthCheck));

/**
 * @route   GET /health/status
 * @desc    Detailed system status endpoint
 * @access  Public
 */
router.get('/status', asyncErrorHandler(healthController.systemStatus));

/**
 * @route   GET /health/ready
 * @desc    Readiness probe for container orchestration
 * @access  Public
 */
router.get('/ready', asyncErrorHandler(healthController.readinessProbe));

/**
 * @route   GET /health/live
 * @desc    Liveness probe for container orchestration
 * @access  Public
 */
router.get('/live', asyncErrorHandler(healthController.livenessProbe));

module.exports = router;
