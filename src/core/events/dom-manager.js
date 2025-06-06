/**
 * DOM Event Manager
 * Handles DOM events using the custom event system
 */

import { EventEmitter } from './emitter.js';

export class DOMEventManager {
  constructor() {
    this.emitter = new EventEmitter();
    this.delegatedEvents = new Set();
    this.setupDelegation();
  }

  /**
   * Set up event delegation for common events
   */
  setupDelegation() {
    const commonEvents = ['click', 'input', 'change', 'submit', 'keydown', 'keyup'];
    
    commonEvents.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        this.handleDelegatedEvent(eventType, e);
      }, true);
      
      this.delegatedEvents.add(eventType);
    });
  }

  /**
   * Handle delegated DOM events
   */
  handleDelegatedEvent(eventType, domEvent) {
    let target = domEvent.target;

    while (target && target !== document) {
      const eventKey = `${eventType}:${this.getElementSelector(target)}`;
      
      this.emitter.emit(eventKey, {
        originalEvent: domEvent,
        target,
        type: eventType,
        preventDefault: () => domEvent.preventDefault(),
        stopPropagation: () => domEvent.stopPropagation()
      });

      if (target._miniFrameworkId) {
        this.emitter.emit(`${eventType}:element:${target._miniFrameworkId}`, {
          originalEvent: domEvent,
          target,
          type: eventType,
          preventDefault: () => domEvent.preventDefault(),
          stopPropagation: () => domEvent.stopPropagation()
        });
      }

      target = target.parentElement;
    }
  }

  /**
   * Generate a selector for an element
   */
  getElementSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      return `.${element.className.split(' ').join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }

  /**
   * Bind an event to an element using custom event system
   */
  bind(element, eventType, handler) {
    if (!this.validateBindInputs(element, eventType, handler)) {
      return () => {};
    }

    if (!element._miniFrameworkId) {
      element._miniFrameworkId = `element_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    const eventKey = `${eventType}:element:${element._miniFrameworkId}`;
    return this.emitter.on(eventKey, handler);
  }

  /**
   * Create a declarative event map for an element
   */
  bindEvents(element, eventMap) {
    const unbindFunctions = [];

    Object.entries(eventMap).forEach(([eventType, handler]) => {
      const unbind = this.bind(element, eventType, handler);
      unbindFunctions.push(unbind);
    });

    return () => {
      unbindFunctions.forEach(unbind => unbind());
    };
  }

  /**
   * Get the event emitter instance
   */
  getEmitter() {
    return this.emitter;
  }

  /**
   * Validate bind inputs
   */
  validateBindInputs(element, eventType, handler) {
    if (!element || !element.nodeType) {
      console.error('Invalid element provided to bind()');
      return false;
    }

    if (typeof eventType !== 'string') {
      console.error('Event type must be a string');
      return false;
    }

    if (typeof handler !== 'function') {
      console.error('Event handler must be a function');
      return false;
    }

    return true;
  }
}
