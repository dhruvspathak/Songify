/**
 * Secure Logging Utilities for Backend
 * Prevents log forging (CWE-117) by sanitizing and encoding all user input before logging
 */

/**
 * Encode special characters that could be used for log forging
 * @param {string} input - Input string to encode
 * @returns {string} Encoded string safe for logging
 */
const encodeForLog = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // First, limit length to prevent log flooding
  let sanitized = input.substring(0, 500);
  
  // Encode ALL potentially dangerous characters for log safety
  return sanitized
    // Encode newline characters that could break log format
    .replace(/\r\n/g, '\\r\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    // Encode tab characters
    .replace(/\t/g, '\\t')
    // Encode backslashes to prevent escape sequence injection
    .replace(/\\/g, '\\\\')
    // Encode quotes that could break log parsing
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    // Encode control characters (0x00-0x1F and 0x7F-0x9F)
    .replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
    // Encode Unicode line separators
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
    // Encode other potentially dangerous Unicode characters
    .replace(/[\u0085\u00A0\u1680\u180E\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000\uFEFF]/g, 
      (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`);
};

/**
 * Sanitize and validate input for safe logging
 * @param {any} input - Input to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} Sanitized input safe for logging
 */
const sanitizeForLog = (input, options = {}) => {
  const { 
    maxLength = 100, 
    maskSensitive = true, 
    fieldName = 'unknown'
  } = options;
  
  // Handle null/undefined
  if (input === null || input === undefined) {
    return '[NULL]';
  }
  
  // Convert to string and immediately encode to prevent any bypass
  let rawString = String(input);
  
  // ALWAYS encode first to prevent log forging - this is the critical fix
  let encoded = encodeForLog(rawString);
  
  // Mask potentially sensitive data patterns AFTER encoding
  if (maskSensitive) {
    // Check original string for sensitive patterns, but return masked result
    if (rawString.length > 20 && /^[A-Za-z0-9+/=_-]+$/.test(rawString)) {
      return `[${fieldName.toUpperCase()}_MASKED:${encodeForLog(rawString.substring(0, 4))}***${encodeForLog(rawString.substring(rawString.length - 4))}]`;
    }
    
    // Mask email addresses
    if (rawString.includes('@') && rawString.includes('.')) {
      return '[EMAIL_MASKED]';
    }
    
    // Mask URLs
    if (rawString.startsWith('http://') || rawString.startsWith('https://')) {
      return '[URL_MASKED]';
    }
    
    // Mask file paths
    if (rawString.includes('/') && rawString.length > 10) {
      return '[PATH_MASKED]';
    }
  }
  
  // Truncate encoded string if too long
  if (encoded.length > maxLength) {
    encoded = encoded.substring(0, maxLength) + '[TRUNCATED]';
  }
  
  // Return the encoded string - no further processing to prevent bypass
  return encoded;
};

/**
 * Sanitize HTTP request data for logging
 * @param {object} req - Express request object
 * @returns {object} Sanitized request data
 */
const sanitizeRequestForLog = (req) => {
  if (!req) return '[NO_REQUEST]';
  
  // Ensure ALL request data is properly encoded to prevent log forging
  return {
    method: sanitizeForLog(req.method, { fieldName: 'method', maxLength: 10, maskSensitive: false }),
    path: sanitizeForLog(req.path, { fieldName: 'path', maxLength: 200, maskSensitive: true }),
    url: sanitizeForLog(req.url, { fieldName: 'url', maxLength: 200, maskSensitive: true }),
    ip: sanitizeForLog(req.ip, { fieldName: 'ip', maxLength: 45, maskSensitive: false }),
    userAgent: req.get('User-Agent') ? '[USER_AGENT_REDACTED]' : '[NO_USER_AGENT]'
  };
};

/**
 * Sanitize error object for logging
 * @param {Error|any} error - Error object to sanitize
 * @returns {object} Sanitized error data
 */
const sanitizeErrorForLog = (error) => {
  if (!error) return '[NO_ERROR]';
  
  if (error instanceof Error) {
    return {
      name: sanitizeForLog(error.name, { fieldName: 'errorName', maxLength: 50, maskSensitive: false }),
      message: sanitizeForLog(error.message, { fieldName: 'errorMessage', maxLength: 200, maskSensitive: true }),
      // Don't include stack trace in production to avoid path disclosure
      stack: process.env.NODE_ENV === 'development' ? '[STACK_REDACTED_IN_PROD]' : '[STACK_REDACTED]'
    };
  }
  
  return {
    error: sanitizeForLog(String(error), { fieldName: 'error', maxLength: 200, maskSensitive: true })
  };
};

/**
 * Secure console.log that prevents log forging
 * @param {string} message - Log message
 * @param {any} data - Data to log (will be sanitized)
 */
const secureLog = (message, data = null) => {
  const timestamp = new Date().toISOString();
  // CRITICAL: Always encode the message to prevent log forging
  const safeMessage = encodeForLog(String(message || ''));
  
  if (data === null || data === undefined) {
    console.log(`[${timestamp}] ${safeMessage}`);
    return;
  }
  
  let sanitizedData;
  
  if (typeof data === 'object' && data !== null) {
    // Handle different object types
    if (data.method && data.url) {
      // Looks like request object
      sanitizedData = sanitizeRequestForLog(data);
    } else if (data.name && data.message) {
      // Looks like error object
      sanitizedData = sanitizeErrorForLog(data);
    } else {
      // Generic object sanitization - ensure ALL keys and values are encoded
      sanitizedData = Object.keys(data).reduce((acc, key) => {
        const value = data[key];
        const safeKey = encodeForLog(String(key));
        acc[safeKey] = sanitizeForLog(value, { fieldName: key, maskSensitive: true });
        return acc;
      }, {});
    }
  } else {
    sanitizedData = sanitizeForLog(data, { fieldName: 'data', maskSensitive: true });
  }
  
  console.log(`[${timestamp}] ${safeMessage}`, sanitizedData);
};

/**
 * Secure console.error that prevents log forging
 * @param {string} message - Error message
 * @param {any} error - Error data (will be sanitized)
 */
const secureError = (message, error = null) => {
  const timestamp = new Date().toISOString();
  // CRITICAL: Always encode the message to prevent log forging
  const safeMessage = encodeForLog(String(message || ''));
  
  if (error === null || error === undefined) {
    console.error(`[${timestamp}] ERROR: ${safeMessage}`);
    return;
  }
  
  const sanitizedError = sanitizeErrorForLog(error);
  console.error(`[${timestamp}] ERROR: ${safeMessage}`, sanitizedError);
};

/**
 * Secure console.warn that prevents log forging
 * @param {string} message - Warning message
 * @param {any} data - Data to log (will be sanitized)
 */
const secureWarn = (message, data = null) => {
  const timestamp = new Date().toISOString();
  // CRITICAL: Always encode the message to prevent log forging
  const safeMessage = encodeForLog(String(message || ''));
  
  if (data === null || data === undefined) {
    console.warn(`[${timestamp}] WARN: ${safeMessage}`);
    return;
  }
  
  let sanitizedData;
  if (typeof data === 'object' && data !== null) {
    if (data.method && data.url) {
      sanitizedData = sanitizeRequestForLog(data);
    } else {
      // Generic object sanitization with encoding
      sanitizedData = Object.keys(data).reduce((acc, key) => {
        const value = data[key];
        const safeKey = encodeForLog(String(key));
        acc[safeKey] = sanitizeForLog(value, { fieldName: key, maskSensitive: true });
        return acc;
      }, {});
    }
  } else {
    sanitizedData = sanitizeForLog(data, { fieldName: 'data', maskSensitive: true });
  }
    
  console.warn(`[${timestamp}] WARN: ${safeMessage}`, sanitizedData);
};

/**
 * Log authentication events securely
 * @param {string} event - Event type
 * @param {object} details - Event details (will be sanitized)
 */
const logAuthEvent = (event, details = {}) => {
  const safeEvent = sanitizeForLog(event, { fieldName: 'authEvent', maxLength: 50, maskSensitive: false });
  
  const sanitizedDetails = {
    ip: details.ip ? sanitizeForLog(details.ip, { fieldName: 'ip', maxLength: 45, maskSensitive: false }) : '[NO_IP]',
    userAgent: details.userAgent ? '[USER_AGENT_REDACTED]' : '[NO_USER_AGENT]',
    code: details.code ? `[CODE_MASKED:${encodeForLog(details.code.substring(0, 4))}***]` : '[NO_CODE]',
    state: details.state ? `[STATE_MASKED:${encodeForLog(details.state.substring(0, 4))}***]` : '[NO_STATE]',
    success: Boolean(details.success),
    error: details.error ? sanitizeForLog(details.error, { fieldName: 'authError', maxLength: 100, maskSensitive: true }) : null
  };
  
  secureLog(`AUTH_EVENT: ${safeEvent}`, sanitizedDetails);
};

module.exports = {
  secureLog,
  secureError,
  secureWarn,
  logAuthEvent,
  sanitizeForLog,
  sanitizeRequestForLog,
  sanitizeErrorForLog,
  encodeForLog
};
