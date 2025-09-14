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
  
  return input
    // Remove or encode newline characters that could break log format
    .replace(/\r\n/g, '\\r\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    // Remove or encode tab characters
    .replace(/\t/g, '\\t')
    // Encode other control characters
    .replace(/[\x00-\x1F\x7F]/g, (char) => `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
    // Limit length to prevent log flooding
    .substring(0, 500);
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
    allowedChars = /^[a-zA-Z0-9\-_.@+/=\s]*$/,
    fieldName = 'unknown'
  } = options;
  
  // Handle null/undefined
  if (input === null || input === undefined) {
    return '[NULL]';
  }
  
  // Convert to string
  let sanitized = String(input);
  
  // Mask potentially sensitive data patterns
  if (maskSensitive) {
    // Mask tokens, codes, and other sensitive patterns
    if (sanitized.length > 20 && /^[A-Za-z0-9+/=_-]+$/.test(sanitized)) {
      return `[${fieldName.toUpperCase()}_MASKED:${sanitized.substring(0, 4)}***${sanitized.substring(sanitized.length - 4)}]`;
    }
    
    // Mask email addresses
    if (sanitized.includes('@') && sanitized.includes('.')) {
      return '[EMAIL_MASKED]';
    }
    
    // Mask URLs
    if (sanitized.startsWith('http://') || sanitized.startsWith('https://')) {
      return '[URL_MASKED]';
    }
  }
  
  // Check against allowed characters
  if (!allowedChars.test(sanitized)) {
    return `[INVALID_CHARS_IN_${fieldName.toUpperCase()}]`;
  }
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }
  
  // Final encoding for log safety
  return encodeForLog(sanitized);
};

/**
 * Sanitize HTTP request data for logging
 * @param {object} req - Express request object
 * @returns {object} Sanitized request data
 */
const sanitizeRequestForLog = (req) => {
  if (!req) return '[NO_REQUEST]';
  
  return {
    method: sanitizeForLog(req.method, { fieldName: 'method', maxLength: 10 }),
    path: sanitizeForLog(req.path, { fieldName: 'path', maxLength: 200 }),
    url: sanitizeForLog(req.url, { fieldName: 'url', maxLength: 200 }),
    ip: sanitizeForLog(req.ip, { fieldName: 'ip', maxLength: 45 }),
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
      name: sanitizeForLog(error.name, { fieldName: 'errorName', maxLength: 50 }),
      message: sanitizeForLog(error.message, { fieldName: 'errorMessage', maxLength: 200 }),
      // Don't include stack trace in production to avoid path disclosure
      stack: process.env.NODE_ENV === 'development' ? '[STACK_REDACTED_IN_PROD]' : '[STACK_REDACTED]'
    };
  }
  
  return {
    error: sanitizeForLog(String(error), { fieldName: 'error', maxLength: 200 })
  };
};

/**
 * Secure console.log that prevents log forging
 * @param {string} message - Log message
 * @param {any} data - Data to log (will be sanitized)
 */
const secureLog = (message, data = null) => {
  const timestamp = new Date().toISOString();
  const safeMessage = encodeForLog(message);
  
  if (data === null || data === undefined) {
    console.log(`[${timestamp}] ${safeMessage}`);
    return;
  }
  
  let sanitizedData;
  
  if (typeof data === 'object') {
    // Handle different object types
    if (data.method && data.url) {
      // Looks like request object
      sanitizedData = sanitizeRequestForLog(data);
    } else if (data.name && data.message) {
      // Looks like error object
      sanitizedData = sanitizeErrorForLog(data);
    } else {
      // Generic object sanitization
      sanitizedData = Object.keys(data).reduce((acc, key) => {
        const value = data[key];
        acc[key] = sanitizeForLog(value, { fieldName: key });
        return acc;
      }, {});
    }
  } else {
    sanitizedData = sanitizeForLog(data, { fieldName: 'data' });
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
  const safeMessage = encodeForLog(message);
  
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
  const safeMessage = encodeForLog(message);
  
  if (data === null || data === undefined) {
    console.warn(`[${timestamp}] WARN: ${safeMessage}`);
    return;
  }
  
  const sanitizedData = typeof data === 'object' ? 
    sanitizeRequestForLog(data) : 
    sanitizeForLog(data, { fieldName: 'data' });
    
  console.warn(`[${timestamp}] WARN: ${safeMessage}`, sanitizedData);
};

/**
 * Log authentication events securely
 * @param {string} event - Event type
 * @param {object} details - Event details (will be sanitized)
 */
const logAuthEvent = (event, details = {}) => {
  const safeEvent = sanitizeForLog(event, { fieldName: 'authEvent', maxLength: 50 });
  
  const sanitizedDetails = {
    ip: details.ip ? sanitizeForLog(details.ip, { fieldName: 'ip', maxLength: 45 }) : '[NO_IP]',
    userAgent: details.userAgent ? '[USER_AGENT_REDACTED]' : '[NO_USER_AGENT]',
    code: details.code ? `[CODE_MASKED:${details.code.substring(0, 4)}***]` : '[NO_CODE]',
    state: details.state ? `[STATE_MASKED:${details.state.substring(0, 4)}***]` : '[NO_STATE]',
    success: Boolean(details.success),
    error: details.error ? sanitizeForLog(details.error, { fieldName: 'authError', maxLength: 100 }) : null
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
