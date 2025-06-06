/**
 * Event Emitter Core
 * Core event emission and subscription functionality
 */

export class EventEmitter {
  constructor() {
    this.events = new Map();
    this.maxListeners = 1000;
    this.maxEventNameLength = 100;
    this.emitCount = 0;
    this.maxEmitsPerSecond = 1000;
    this.lastEmitReset = Date.now();
  }

  /**
   * Subscribe to an event
   */
  on(eventName, callback, options = {}) {
    if (!this.validateInputs(eventName, callback)) {
      return () => {};
    }

    const sanitizedEventName = this.sanitizeEventName(eventName);
    if (!sanitizedEventName) {
      return () => {};
    }

    if (!this.checkListenerLimit()) {
      return () => {};
    }

    if (!this.events.has(sanitizedEventName)) {
      this.events.set(sanitizedEventName, []);
    }

    const listener = {
      callback,
      once: options.once || false,
      priority: Math.max(0, Math.min(100, options.priority || 0)),
      id: Symbol('listener'),
      createdAt: Date.now()
    };

    this.events.get(sanitizedEventName).push(listener);
    this.events.get(sanitizedEventName).sort((a, b) => b.priority - a.priority);

    return () => this.off(sanitizedEventName, listener.id);
  }

  /**
   * Subscribe to an event that fires only once
   */
  once(eventName, callback) {
    return this.on(eventName, callback, { once: true });
  }

  /**
   * Unsubscribe from an event
   */
  off(eventName, listenerId) {
    if (!this.events.has(eventName)) return;

    const listeners = this.events.get(eventName);
    const index = listeners.findIndex(listener => listener.id === listenerId);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      this.events.delete(eventName);
    }
  }

  /**
   * Emit an event
   */
  emit(eventName, data) {
    if (typeof eventName !== 'string') {
      console.error('Event name must be a string');
      return false;
    }

    if (!this.checkRateLimit()) {
      return false;
    }

    const sanitizedEventName = eventName.replace(/[<>'"]/g, '');

    if (!this.events.has(sanitizedEventName)) {
      return false;
    }

    const listeners = this.events.get(sanitizedEventName);
    const toRemove = [];
    const listenersCopy = [...listeners];

    listenersCopy.forEach(listener => {
      try {
        if (listeners.includes(listener)) {
          listener.callback(data);

          if (listener.once) {
            toRemove.push(listener.id);
          }
        }
      } catch (error) {
        console.error(`Error in event listener for ${sanitizedEventName}:`, error);
        toRemove.push(listener.id);
      }
    });

    toRemove.forEach(id => this.off(sanitizedEventName, id));
    return true;
  }

  /**
   * Remove all listeners for an event or all events
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get all event names that have listeners
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Get listener count for an event
   */
  listenerCount(eventName) {
    return this.events.has(eventName) ? this.events.get(eventName).length : 0;
  }

  /**
   * Validate inputs
   */
  validateInputs(eventName, callback) {
    if (typeof eventName !== 'string') {
      console.error('Event name must be a string');
      return false;
    }

    if (typeof callback !== 'function') {
      console.error('Callback must be a function');
      return false;
    }

    if (eventName.length > this.maxEventNameLength) {
      console.warn(`Event name too long (${eventName.length} > ${this.maxEventNameLength})`);
      return false;
    }

    return true;
  }

  /**
   * Sanitize event name
   */
  sanitizeEventName(eventName) {
    const sanitized = eventName.replace(/[<>'"]/g, '');
    if (sanitized !== eventName) {
      console.warn('Event name contained potentially dangerous characters');
    }
    return sanitized;
  }

  /**
   * Check listener limit
   */
  checkListenerLimit() {
    const totalListeners = Array.from(this.events.values())
      .reduce((total, listeners) => total + listeners.length, 0);

    if (totalListeners >= this.maxListeners) {
      console.warn(`Maximum listeners (${this.maxListeners}) reached. Listener ignored.`);
      return false;
    }

    return true;
  }

  /**
   * Check rate limit
   */
  checkRateLimit() {
    const now = Date.now();
    if (now - this.lastEmitReset > 1000) {
      this.emitCount = 0;
      this.lastEmitReset = now;
    }

    this.emitCount++;
    if (this.emitCount > this.maxEmitsPerSecond) {
      console.warn('Event emission rate limit exceeded');
      return false;
    }

    return true;
  }
}
