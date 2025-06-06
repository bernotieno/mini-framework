/**
 * Utility Functions
 * Main utilities index - exports all utility functions
 */

// Object utilities
export { deepClone, deepMerge, isEmpty } from './utils/object.js';

// Function utilities
export { debounce, throttle } from './utils/function.js';

// String utilities
export {
  capitalize,
  camelToKebab,
  kebabToCamel,
  escapeHtml,
  template,
  generateId
} from './utils/string.js';

// Date utilities
export { formatDate } from './utils/date.js';

// Validation utilities
export { validators } from './utils/validation.js';

// Event utilities
export { EventBus } from './utils/events.js';

// Storage utilities
export { storage } from './utils/storage.js';


