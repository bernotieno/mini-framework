/**
 * State Security Module
 * Handles state sanitization and security validation
 */

export class StateSecurity {
  constructor(maxDepth = 50) {
    this.maxDepth = maxDepth;
  }

  /**
   * Sanitize state to prevent prototype pollution and other security issues
   */
  sanitizeState(state) {
    if (state === null || typeof state !== 'object') {
      return state;
    }

    if (Array.isArray(state)) {
      return state.map(item => this.sanitizeState(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(state)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        console.warn(`Blocked potentially dangerous key: ${key}`);
        continue;
      }

      // Validate key
      if (typeof key !== 'string' || key.trim() === '') {
        console.warn('Invalid state key:', key);
        continue;
      }

      sanitized[key] = this.sanitizeState(value);
    }

    return sanitized;
  }

  /**
   * Validate state path for security and depth
   */
  validatePath(path) {
    if (typeof path !== 'string') {
      console.error('State path must be a string');
      return false;
    }

    if (path.trim() === '') {
      console.error('Empty state path provided');
      return false;
    }

    const keys = path.split('.');
    if (keys.length > this.maxDepth) {
      console.warn(`State path too deep (${keys.length} > ${this.maxDepth}): ${path}`);
      return false;
    }

    return true;
  }

  /**
   * Validate individual key for dangerous values
   */
  validateKey(key) {
    return !(key === '__proto__' || key === 'constructor' || key === 'prototype');
  }
}
