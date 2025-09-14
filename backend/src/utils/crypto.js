/**
 * Cryptographic Utilities
 * Helper functions for generating secure random strings and encoding
 */

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length of the string to generate
 * @returns {string} Random string
 */
const generateRandomString = (length = 16) => {
  const crypto = require('crypto');
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, possible.length);
    text += possible.charAt(randomIndex);
  }
  
  return text;
};

/**
 * Create Basic Auth header for Spotify API
 * @param {string} clientId - Spotify client ID
 * @param {string} clientSecret - Spotify client secret
 * @returns {string} Base64 encoded auth header
 */
const createBasicAuthHeader = (clientId, clientSecret) => {
  return 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
};

/**
 * Generate secure cookie options based on environment
 * @param {string} environment - Current environment (development/production)
 * @param {number} maxAge - Cookie max age in milliseconds (optional)
 * @returns {object} Cookie options
 */
const generateCookieOptions = (environment, maxAge) => {
  const options = {
    httpOnly: true,
    secure: environment === 'production',
    sameSite: 'lax'
  };
  
  // Only set maxAge if provided to avoid undefined values
  if (maxAge !== undefined && maxAge !== null) {
    options.maxAge = maxAge;
  }
  
  return options;
};

module.exports = {
  generateRandomString,
  createBasicAuthHeader,
  generateCookieOptions
};
