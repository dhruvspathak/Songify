/**
 * Authorization Code Manager
 * Manages used authorization codes to prevent replay attacks
 */

class CodeManager {
  constructor() {
    this.usedCodes = new Set();
  }

  /**
   * Check if authorization code has been used
   * @param {string} code - Authorization code
   * @returns {boolean} True if code has been used
   */
  isCodeUsed(code) {
    return this.usedCodes.has(code);
  }

  /**
   * Mark authorization code as used
   * @param {string} code - Authorization code
   * @param {number} cleanupDelay - Time in ms before code is removed from memory
   */
  markCodeAsUsed(code, cleanupDelay = 5 * 60 * 1000) {
    this.usedCodes.add(code);
    
    // Clean up used codes after specified delay to prevent memory leaks
    setTimeout(() => {
      this.usedCodes.delete(code);
    }, cleanupDelay);
  }

  /**
   * Remove code from used codes (for error recovery)
   * @param {string} code - Authorization code
   */
  removeCode(code) {
    this.usedCodes.delete(code);
  }

  /**
   * Get count of currently tracked codes
   * @returns {number} Number of codes being tracked
   */
  getCodeCount() {
    return this.usedCodes.size;
  }

  /**
   * Clear all used codes (for testing or reset)
   */
  clearAllCodes() {
    this.usedCodes.clear();
  }
}

// Export singleton instance
module.exports = new CodeManager();
