/**
 * Authentication Controller
 * Handles all authentication-related endpoints
 */

const config = require('../config/environment');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, COOKIE_NAMES } = require('../constants');
const { 
  generateRandomString, 
  generateCookieOptions,
  buildAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getUserProfile,
  testEndpointAccess,
  codeManager
} = require('../utils');

/**
 * Initiate Spotify OAuth login
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const login = (req, res) => {
  try {
    const state = generateRandomString(16);
    const redirectUri = `${config.FRONTEND_URL}/callback`;
    
    // Store state in secure cookie
    const cookieOptions = generateCookieOptions(config.NODE_ENV, config.SECURITY.SESSION_TIMEOUT);
    res.cookie(COOKIE_NAMES.AUTH_STATE, state, cookieOptions);

    // Build and redirect to Spotify authorization URL
    const authUrl = buildAuthorizationUrl(state, redirectUri);
    
    // Validate redirect URL is to Spotify domain for security
    if (!authUrl.startsWith('https://accounts.spotify.com/')) {
      throw new Error('Invalid redirect URL');
    }
    
    res.redirect(authUrl);
  } catch (error) {
    console.error('Login initiation error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
};

/**
 * Handle OAuth callback from Spotify
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const callback = async (req, res) => {
  try {
    const { code, state } = req.body;
    const storedState = req.cookies[COOKIE_NAMES.AUTH_STATE];

    // Validate required parameters
    if (!code || !state) {
      console.log('Missing callback parameters:', { code: !!code, state: !!state });
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGES.MISSING_PARAMETERS
      });
    }

    // Validate state to prevent CSRF attacks
    if (state !== storedState) {
      console.log('State mismatch in callback');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGES.STATE_MISMATCH
      });
    }

    // Clear state cookie
    res.clearCookie(COOKIE_NAMES.AUTH_STATE);

    // Check for code reuse
    if (codeManager.isCodeUsed(code)) {
      console.log('Authorization code reuse attempt:', code.substring(0, 20) + '...');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGES.CODE_ALREADY_USED
      });
    }

    // Mark code as used
    codeManager.markCodeAsUsed(code, config.SECURITY.TOKEN_CLEANUP_INTERVAL);

    // Exchange code for tokens
    const redirectUri = `${config.FRONTEND_URL}/callback`;
    console.log('Attempting token exchange...');
    
    const tokenData = await exchangeCodeForTokens(code, redirectUri);
    console.log('✅ Token exchange successful');

    const { access_token, refresh_token, expires_in } = tokenData;

    // Set secure cookies
    const cookieOptions = generateCookieOptions(config.NODE_ENV);
    
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, access_token, {
      ...cookieOptions,
      maxAge: expires_in * 1000
    });

    if (refresh_token) {
      res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refresh_token, {
        ...cookieOptions,
        maxAge: config.SECURITY.REFRESH_TOKEN_EXPIRY
      });
    }

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.AUTH_SUCCESS,
      expires_in: expires_in
    });
  } catch (error) {
    // Clean up failed authorization code
    const { code } = req.body;
    if (code && codeManager.isCodeUsed(code)) {
      codeManager.removeCode(code);
      console.log('Removed failed authorization code from tracking');
    }

    console.error('OAuth callback error:', {
      error: error.message,
      response: error.response?.data,
      requestBody: req.body
    });

    // Provide specific error messages
    let errorMessage = ERROR_MESSAGES.AUTH_FAILED;
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;

    if (error.response?.data?.error === 'invalid_grant') {
      errorMessage = 'Authorization code is invalid or expired. Please try logging in again.';
      statusCode = HTTP_STATUS.BAD_REQUEST;
    } else if (error.response?.data?.error === 'invalid_client') {
      errorMessage = 'Invalid client credentials. Please check your Spotify app configuration.';
      statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.response?.data?.error_description || error.message
    });
  }
};

/**
 * Get current user profile
 * @param {object} req - Express request object (with user attached by middleware)
 * @param {object} res - Express response object
 */
const getCurrentUser = (req, res) => {
  try {
    // User data is attached by validateTokenAndUser middleware
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.USER_DATA_FETCH_FAILED
    });
  }
};

/**
 * Get access token for frontend use
 * @param {object} req - Express request object (with accessToken attached by middleware)
 * @param {object} res - Express response object
 */
const getAccessToken = (req, res) => {
  try {
    res.json({
      success: true,
      access_token: req.accessToken
    });
  } catch (error) {
    console.error('Get access token error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.TOKEN_RETRIEVAL_FAILED
    });
  }
};

/**
 * Debug endpoint to check token and permissions
 * @param {object} req - Express request object (with accessToken attached by middleware)
 * @param {object} res - Express response object
 */
const debugToken = async (req, res) => {
  try {
    // Get user profile
    const userProfile = await getUserProfile(req.accessToken);
    
    // Test endpoint access
    const endpointTests = await testEndpointAccess(req.accessToken);

    res.json({
      success: true,
      user: {
        id: userProfile.id,
        display_name: userProfile.display_name,
        email: userProfile.email,
        country: userProfile.country,
        product: userProfile.product
      },
      tokenValid: true,
      tokenInfo: 'Spotify uses opaque tokens - scope info determined by endpoint access',
      requestedScopes: config.SPOTIFY.SCOPES,
      endpointTests: endpointTests
    });
  } catch (error) {
    console.error('Debug token error:', error.response?.data || error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.DEBUG_CHECK_FAILED,
      details: error.response?.data || error.message
    });
  }
};

/**
 * Refresh access token using refresh token
 * @param {object} req - Express request object (with refreshToken attached by middleware)
 * @param {object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    const tokenData = await refreshAccessToken(req.refreshToken);
    const { access_token, expires_in, refresh_token: new_refresh_token } = tokenData;

    const cookieOptions = generateCookieOptions(config.NODE_ENV);

    // Set new access token
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, access_token, {
      ...cookieOptions,
      maxAge: expires_in * 1000
    });

    // Set new refresh token if provided
    if (new_refresh_token) {
      res.cookie(COOKIE_NAMES.REFRESH_TOKEN, new_refresh_token, {
        ...cookieOptions,
        maxAge: config.SECURITY.REFRESH_TOKEN_EXPIRY
      });
    }

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.TOKEN_REFRESHED
    });
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.TOKEN_REFRESH_FAILED
    });
  }
};

/**
 * Logout user by clearing cookies
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const logout = (req, res) => {
  try {
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN);
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
};

module.exports = {
  login,
  callback,
  getCurrentUser,
  getAccessToken,
  debugToken,
  refreshToken,
  logout
};
