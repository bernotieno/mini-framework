/**
 * Custom Event System
 * Main exports for the event system
 */

import { EventEmitter } from './events/emitter.js';
import { DOMEventManager } from './events/dom-manager.js';

// Export default instances
export const eventEmitter = new EventEmitter();
export const domEvents = new DOMEventManager();

// Export classes for custom instances
export { EventEmitter, DOMEventManager };


