/**
 * Authentication Middleware
 * Handles token validation and user authentication
 */

const { HTTP_STATUS, ERROR_MESSAGES, COOKIE_NAMES } = require('../constants');
const { getUserProfile } = require('../utils/spotify');

/**
 * Middleware to validate Spotify access token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateAccessToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];

    if (!accessToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.NOT_AUTHENTICATED
      });
    }

    // Attach token to request for use in controllers
    req.accessToken = accessToken;
    next();
  } catch (error) {
    console.error('Token validation error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
};

/**
 * Middleware to validate token and fetch user data
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateTokenAndUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];

    if (!accessToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.NOT_AUTHENTICATED
      });
    }

    // Validate token by fetching user profile
    const userProfile = await getUserProfile(accessToken);
    
    // Attach token and user to request
    req.accessToken = accessToken;
    req.user = userProfile;
    next();
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.TOKEN_EXPIRED,
        refresh_needed: true
      });
    }

    console.error('Token and user validation error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
};

/**
 * Middleware to check for refresh token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

  if (!refreshToken) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.NO_REFRESH_TOKEN
    });
  }

  req.refreshToken = refreshToken;
  next();
};

module.exports = {
  validateAccessToken,
  validateTokenAndUser,
  requireRefreshToken
};
