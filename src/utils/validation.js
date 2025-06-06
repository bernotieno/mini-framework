/**
 * Validation Utilities
 * Functions for data validation
 */

import { isEmpty } from './object.js';

/**
 * Simple validation functions
 */
export const validators = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  required: (value) => !isEmpty(value),
  minLength: (min) => (value) => value && value.length >= min,
  maxLength: (max) => (value) => value && value.length <= max,
  pattern: (regex) => (value) => regex.test(value)
};
