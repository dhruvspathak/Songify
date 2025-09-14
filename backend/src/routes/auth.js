/**
 * Authentication Routes
 * Defines all authentication-related endpoints
 */

const express = require('express');
const { authController } = require('../controllers');
const { validateAccessToken, validateTokenAndUser, requireRefreshToken, asyncErrorHandler } = require('../middleware');

const router = express.Router();

/**
 * @route   GET /auth/login
 * @desc    Initiate Spotify OAuth login
 * @access  Public
 */
router.get('/login', asyncErrorHandler(authController.login));

/**
 * @route   POST /auth/callback
 * @desc    Handle OAuth callback from Spotify
 * @access  Public
 */
router.post('/callback', asyncErrorHandler(authController.callback));

/**
 * @route   GET /auth/me
 * @desc    Get current user profile
 * @access  Private (requires valid access token)
 */
router.get('/me', validateTokenAndUser, asyncErrorHandler(authController.getCurrentUser));

/**
 * @route   GET /auth/token
 * @desc    Get access token for frontend use
 * @access  Private (requires valid access token)
 */
router.get('/token', validateAccessToken, asyncErrorHandler(authController.getAccessToken));

/**
 * @route   GET /auth/debug
 * @desc    Debug endpoint to check token and permissions
 * @access  Private (requires valid access token)
 */
router.get('/debug', validateAccessToken, asyncErrorHandler(authController.debugToken));

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Private (requires valid refresh token)
 */
router.post('/refresh', requireRefreshToken, asyncErrorHandler(authController.refreshToken));

/**
 * @route   POST /auth/logout
 * @desc    Logout user by clearing cookies
 * @access  Public
 */
router.post('/logout', asyncErrorHandler(authController.logout));

module.exports = router;
