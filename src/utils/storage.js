/**
 * Storage Utilities
 * Local storage helpers with enhanced security
 */

export const storage = {
  get: (key, defaultValue = null) => {
    // Validate key
    if (typeof key !== 'string' || key.trim() === '') {
      console.error('Storage key must be a non-empty string');
      return defaultValue;
    }

    // Sanitize key
    const sanitizedKey = key.replace(/[<>'"]/g, '');
    if (sanitizedKey !== key) {
      console.warn('Storage key contained potentially dangerous characters');
    }

    try {
      const item = localStorage.getItem(sanitizedKey);
      if (item === null) {
        return defaultValue;
      }

      const parsed = JSON.parse(item);

      // Basic validation of parsed data
      if (typeof parsed === 'object' && parsed !== null) {
        // Check for prototype pollution attempts
        if (parsed.hasOwnProperty('__proto__') ||
            parsed.hasOwnProperty('constructor') ||
            parsed.hasOwnProperty('prototype')) {
          console.warn('Potentially dangerous object structure detected in storage');
          return defaultValue;
        }
      }

      return parsed;
    } catch (error) {
      console.error('Error parsing stored data:', error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    // Validate key
    if (typeof key !== 'string' || key.trim() === '') {
      console.error('Storage key must be a non-empty string');
      return false;
    }

    // Sanitize key
    const sanitizedKey = key.replace(/[<>'"]/g, '');
    if (sanitizedKey !== key) {
      console.warn('Storage key contained potentially dangerous characters');
    }

    try {
      // Validate value size (5MB limit for localStorage)
      const serialized = JSON.stringify(value);
      if (serialized.length > 5 * 1024 * 1024) {
        console.error('Value too large for localStorage (>5MB)');
        return false;
      }

      // Check for potentially dangerous content
      if (typeof value === 'object' && value !== null) {
        if (value.hasOwnProperty('__proto__') ||
            value.hasOwnProperty('constructor') ||
            value.hasOwnProperty('prototype')) {
          console.warn('Blocked storage of potentially dangerous object structure');
          return false;
        }
      }

      localStorage.setItem(sanitizedKey, serialized);
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  },

  remove: (key) => {
    // Validate key
    if (typeof key !== 'string' || key.trim() === '') {
      console.error('Storage key must be a non-empty string');
      return false;
    }

    // Sanitize key
    const sanitizedKey = key.replace(/[<>'"]/g, '');

    try {
      localStorage.removeItem(sanitizedKey);
      return true;
    } catch (error) {
      console.error('Error removing stored data:', error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  // Additional security method to check storage quota
  getQuotaUsage: () => {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return {
        used: total,
        percentage: (total / (5 * 1024 * 1024)) * 100 // Assuming 5MB quota
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return { used: 0, percentage: 0 };
    }
  }
};
