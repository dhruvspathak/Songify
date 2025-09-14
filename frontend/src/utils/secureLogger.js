/**
 * Secure Logging Utilities
 * Provides safe logging functions that prevent PII exposure in logs
 */

/**
 * Mask sensitive strings (like tokens, IDs)
 * @param {string} value - String to mask
 * @param {number} visibleStart - Characters to show at start
 * @param {number} visibleEnd - Characters to show at end
 * @returns {string} Masked string
 */
const maskSensitive = (value, visibleStart = 4, visibleEnd = 4) => {
  if (!value || typeof value !== 'string') return '[REDACTED]';
  if (value.length <= visibleStart + visibleEnd) return '[REDACTED]';
  
  const start = value.substring(0, visibleStart);
  const end = value.substring(value.length - visibleEnd);
  return `${start}***${end}`;
};

/**
 * Sanitize user data for safe logging
 * @param {object} userData - User data object
 * @returns {object} Sanitized user data
 */
const sanitizeUserData = (userData) => {
  if (!userData || typeof userData !== 'object') return '[REDACTED]';
  
  return {
    id: userData.id ? maskSensitive(userData.id) : '[REDACTED]',
    product: userData.product || 'Unknown',
    country: userData.country || 'Unknown',
    // Remove all PII fields
    display_name: '[REDACTED]',
    email: '[REDACTED]',
    followers: userData.followers ? { total: userData.followers.total } : undefined,
    images: userData.images ? '[REDACTED - ' + userData.images.length + ' images]' : undefined
  };
};

/**
 * Sanitize device data for safe logging
 * @param {object} deviceData - Device data object
 * @returns {object} Sanitized device data
 */
const sanitizeDeviceData = (deviceData) => {
  if (!deviceData || typeof deviceData !== 'object') return '[REDACTED]';
  
  if (Array.isArray(deviceData)) {
    return deviceData.map(device => ({
      id: device.id ? maskSensitive(device.id) : '[REDACTED]',
      name: device.name || 'Unknown Device',
      type: device.type || 'Unknown',
      is_active: device.is_active || false,
      is_private_session: device.is_private_session || false,
      is_restricted: device.is_restricted || false
    }));
  }
  
  // Handle devices object with devices array
  if (deviceData.devices) {
    return {
      devices: sanitizeDeviceData(deviceData.devices)
    };
  }
  
  // Handle single device object
  return {
    id: deviceData.id ? maskSensitive(deviceData.id) : '[REDACTED]',
    name: deviceData.name || 'Unknown Device',
    type: deviceData.type || 'Unknown',
    is_active: deviceData.is_active || false,
    is_private_session: deviceData.is_private_session || false,
    is_restricted: deviceData.is_restricted || false
  };
};

/**
 * Sanitize debug data for safe logging
 * @param {object} debugData - Debug data object
 * @returns {object} Sanitized debug data
 */
const sanitizeDebugData = (debugData) => {
  if (!debugData || typeof debugData !== 'object') return '[REDACTED]';
  
  return {
    user: debugData.user ? sanitizeUserData(debugData.user) : '[REDACTED]',
    endpointTests: debugData.endpointTests || {},
    // Remove any auth tokens or sensitive test data
    timestamp: new Date().toISOString(),
    // Keep only safe metadata
    scopes: debugData.scopes ? '[SCOPES_REDACTED]' : undefined
  };
};

/**
 * Safe console.log that sanitizes sensitive data
 * @param {string} message - Log message
 * @param {any} data - Data to log (will be sanitized)
 */
const secureLog = (message, data = null) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, only log critical errors
    return;
  }
  
  if (data === null || data === undefined) {
    console.log(message);
    return;
  }
  
  // Sanitize different types of data
  let sanitizedData = data;
  
  if (typeof data === 'object') {
    // Check for common sensitive data patterns
    if (data.user || data.endpointTests) {
      sanitizedData = sanitizeDebugData(data);
    } else if (data.devices || (Array.isArray(data) && data[0]?.id)) {
      sanitizedData = sanitizeDeviceData(data);
    } else if (data.id && data.name && data.type) {
      // Single device object
      sanitizedData = sanitizeDeviceData(data);
    } else {
      // Generic object sanitization
      sanitizedData = Object.keys(data).reduce((acc, key) => {
        const value = data[key];
        
        // Skip sensitive fields entirely
        if (['access_token', 'refresh_token', 'email', 'display_name', 'external_urls'].includes(key)) {
          acc[key] = '[REDACTED]';
        } else if (typeof value === 'string' && value.length > 20) {
          // Mask long strings that might be tokens or IDs
          acc[key] = maskSensitive(value);
        } else {
          acc[key] = value;
        }
        
        return acc;
      }, {});
    }
  }
  
  console.log(message, sanitizedData);
};

/**
 * Safe console.error that sanitizes sensitive data
 * @param {string} message - Error message
 * @param {any} error - Error object or data (will be sanitized)
 */
const secureError = (message, error = null) => {
  if (error === null || error === undefined) {
    console.error(message);
    return;
  }
  
  // For error objects, log only safe properties
  if (error instanceof Error) {
    const errorInfo = {
      name: error.name,
      message: error.message
    };
    
    // Only include stack trace in development to avoid sensitive path exposure
    if (process.env.NODE_ENV !== 'production') {
      errorInfo.stack = error.stack;
    }
    
    console.error(message, errorInfo);
  } else {
    // For other types, use secure log sanitization
    secureLog(message, error);
  }
};

/**
 * Safe console.warn that sanitizes sensitive data
 * @param {string} message - Warning message
 * @param {any} data - Data to log (will be sanitized)
 */
const secureWarn = (message, data = null) => {
  if (data === null || data === undefined) {
    console.warn(message);
    return;
  }
  
  secureLog(message, data);
};

export {
  secureLog,
  secureError,
  secureWarn,
  sanitizeUserData,
  sanitizeDeviceData,
  sanitizeDebugData,
  maskSensitive
};
