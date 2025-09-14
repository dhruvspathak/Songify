/**
 * Input Validation and Sanitization Utilities
 * Provides secure validation and sanitization functions to prevent XSS and injection attacks
 */

/**
 * Sanitize and validate string input
 * @param {any} input - Input to sanitize
 * @param {object} options - Validation options
 * @returns {string} Sanitized string
 */
const sanitizeString = (input, options = {}) => {
  const { maxLength = 1000, allowEmpty = false, pattern = null } = options;
  
  // Convert to string and handle null/undefined
  if (input === null || input === undefined) {
    return allowEmpty ? '' : null;
  }
  
  let sanitized = String(input);
  
  // Remove potentially dangerous characters for XSS prevention
  sanitized = sanitized
    .replace(/[<>'"&]/g, '') // Remove HTML/XML special characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
  
  // Check length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Validate against pattern if provided
  if (pattern && !pattern.test(sanitized)) {
    return null;
  }
  
  return sanitized || (allowEmpty ? '' : null);
};

/**
 * Validate and sanitize numeric input
 * @param {any} input - Input to validate
 * @param {object} options - Validation options
 * @returns {number|null} Validated number or null if invalid
 */
const validateNumber = (input, options = {}) => {
  const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, integer = false } = options;
  
  // Handle null/undefined
  if (input === null || input === undefined || input === '') {
    return null;
  }
  
  // Convert to number
  const num = Number(input);
  
  // Check if it's a valid number
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  // Check integer requirement
  if (integer && !Number.isInteger(num)) {
    return null;
  }
  
  // Check bounds
  if (num < min || num > max) {
    return null;
  }
  
  return num;
};

/**
 * Validate OAuth authorization code
 * @param {any} code - Authorization code to validate
 * @returns {string|null} Validated code or null if invalid
 */
const validateAuthCode = (code) => {
  return sanitizeString(code, {
    maxLength: 512,
    allowEmpty: false,
    pattern: /^[A-Za-z0-9_-]+$/ // Only alphanumeric, underscore, and hyphen
  });
};

/**
 * Validate OAuth state parameter
 * @param {any} state - State parameter to validate
 * @returns {string|null} Validated state or null if invalid
 */
const validateState = (state) => {
  return sanitizeString(state, {
    maxLength: 128,
    allowEmpty: false,
    pattern: /^[A-Za-z0-9]+$/ // Only alphanumeric
  });
};

/**
 * Validate token expiration time
 * @param {any} expiresIn - Expiration time in seconds
 * @returns {number|null} Validated expiration or null if invalid
 */
const validateExpiresIn = (expiresIn) => {
  return validateNumber(expiresIn, {
    min: 1,
    max: 86400 * 365, // Max 1 year in seconds
    integer: true
  });
};

/**
 * Sanitize error messages for safe output
 * @param {any} message - Error message to sanitize
 * @returns {string} Safe error message
 */
const sanitizeErrorMessage = (message) => {
  const sanitized = sanitizeString(message, {
    maxLength: 500,
    allowEmpty: false
  });
  
  // Return a generic message if sanitization fails
  return sanitized || 'An error occurred';
};

/**
 * Validate and sanitize Spotify API response data
 * @param {object} tokenData - Token data from Spotify API
 * @returns {object} Validated and sanitized token data
 */
const validateSpotifyTokenData = (tokenData) => {
  if (!tokenData || typeof tokenData !== 'object') {
    throw new Error('Invalid token data received');
  }
  
  const validated = {};
  
  // Validate access_token
  if (typeof tokenData.access_token === 'string' && tokenData.access_token.length > 0) {
    validated.access_token = sanitizeString(tokenData.access_token, {
      maxLength: 2048,
      pattern: /^[A-Za-z0-9_-]+$/ // Spotify tokens are base64url encoded
    });
  }
  
  if (!validated.access_token) {
    throw new Error('Invalid access token received');
  }
  
  // Validate refresh_token (optional)
  if (tokenData.refresh_token) {
    validated.refresh_token = sanitizeString(tokenData.refresh_token, {
      maxLength: 2048,
      pattern: /^[A-Za-z0-9_-]+$/
    });
  }
  
  // Validate expires_in
  validated.expires_in = validateExpiresIn(tokenData.expires_in);
  if (!validated.expires_in) {
    throw new Error('Invalid expiration time received');
  }
  
  return validated;
};

module.exports = {
  sanitizeString,
  validateNumber,
  validateAuthCode,
  validateState,
  validateExpiresIn,
  sanitizeErrorMessage,
  validateSpotifyTokenData
};
