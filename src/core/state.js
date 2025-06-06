/**
 * Reactive State Management System
 * Main state class that coordinates security, subscriptions, and computed values
 */

import { eventEmitter } from './events.js';
import { StateSecurity } from './state/security.js';
import { SubscribersManager } from './state/subscribers.js';
import { ComputedManager } from './state/computed.js';

export class ReactiveState {
  constructor(initialState = {}) {
    // Initialize sub-modules
    this.security = new StateSecurity();
    this.subscribersManager = new SubscribersManager();
    this.computedManager = new ComputedManager();

    this.state = this.security.sanitizeState(initialState);
  }

  /**
   * Get a value from the state
   */
  get(path) {
    if (!path) return this.state;

    if (!this.security.validatePath(path)) {
      return undefined;
    }

    try {
      const keys = path.split('.');
      return keys.reduce((obj, key) => {
        if (!this.security.validateKey(key)) {
          console.warn(`Blocked access to dangerous key: ${key}`);
          return undefined;
        }
        return obj && obj[key] !== undefined ? obj[key] : undefined;
      }, this.state);
    } catch (error) {
      console.error('Error getting state value:', error);
      return undefined;
    }
  }

  /**
   * Set a value in the state
   */
  set(pathOrState, value) {
    try {
      if (typeof pathOrState === 'object' && pathOrState !== null) {
        // Merge state object
        const sanitizedState = this.security.sanitizeState(pathOrState);
        this.state = { ...this.state, ...sanitizedState };
        this.notifySubscribers();
      } else if (typeof pathOrState === 'string') {
        this.setByPath(pathOrState, value);
      } else {
        console.error('Invalid pathOrState type:', typeof pathOrState);
      }
    } catch (error) {
      console.error('Error setting state value:', error);
    }
  }

  /**
   * Set value by path (helper method)
   */
  setByPath(path, value) {
    if (!this.security.validatePath(path)) {
      return;
    }

    const keys = path.split('.');
    const lastKey = keys.pop();

    if (!this.security.validateKey(lastKey)) {
      console.warn(`Blocked setting dangerous key: ${lastKey}`);
      return;
    }

    // Navigate to the parent object
    const parent = keys.reduce((obj, key) => {
      if (!this.security.validateKey(key)) {
        console.warn(`Blocked navigation through dangerous key: ${key}`);
        return obj;
      }

      if (!obj[key] || typeof obj[key] !== 'object') {
        obj[key] = {};
      }
      return obj[key];
    }, this.state);

    // Set the value
    const oldValue = parent[lastKey];
    const sanitizedValue = this.security.sanitizeState(value);
    parent[lastKey] = sanitizedValue;

    // Only notify if value actually changed
    if (oldValue !== sanitizedValue) {
      this.notifySubscribers(path);
    }
  }

  /**
   * Update state using a function
   * @param {string} path - Dot-notation path
   * @param {Function} updater - Function that receives current value and returns new value
   */
  update(path, updater) {
    const currentValue = this.get(path);
    const newValue = updater(currentValue);
    this.set(path, newValue);
  }

  /**
   * Subscribe to state changes
   * @param {string|Function} pathOrCallback - Path to watch or callback for all changes
   * @param {Function} callback - Callback function (if first param is path)
   * @returns {Function} Unsubscribe function
   */
  subscribe(pathOrCallback, callback) {
    return this.subscribersManager.subscribe(pathOrCallback, callback);
  }

  /**
   * Create a computed value
   */
  computed(name, computeFn, dependencies = []) {
    return this.computedManager.computed(name, computeFn, dependencies, this.subscribe.bind(this));
  }

  /**
   * Get a computed value
   */
  getComputed(name) {
    return this.computedManager.getComputed(name);
  }

  /**
   * Notify subscribers of state changes
   */
  notifySubscribers(changedPath = '*') {
    this.subscribersManager.notifySubscribers(this.state, this.get.bind(this), changedPath);
  }

  /**
   * Create an action that can modify state
   * @param {string} name - Action name
   * @param {Function} actionFn - Action function
   */
  action(name, actionFn) {
    return (...args) => {
      try {
        const result = actionFn(this, ...args);
        
        // Emit action event
        eventEmitter.emit('state:action', {
          name,
          args,
          result,
          state: this.state
        });

        return result;
      } catch (error) {
        console.error(`Error in action ${name}:`, error);
        throw error;
      }
    };
  }

  /**
   * Reset state to initial values
   */
  reset(newInitialState) {
    this.state = newInitialState ? this.security.sanitizeState(newInitialState) : {};
    this.computedManager.clear();
    this.notifySubscribers();
  }

  /**
   * Get a snapshot of the current state
   * @returns {Object} State snapshot
   */
  getSnapshot() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Load state from a snapshot
   * @param {Object} snapshot - State snapshot
   */
  loadSnapshot(snapshot) {
    this.state = JSON.parse(JSON.stringify(snapshot));
    this.notifySubscribers();
  }
}

// Create and export default state instance
export const globalState = new ReactiveState();

// Export convenience functions
export const useState = (initialState) => new ReactiveState(initialState);
export const getState = (path) => globalState.get(path);
export const setState = (path, value) => globalState.set(path, value);
export const updateState = (path, updater) => globalState.update(path, updater);
export const subscribeToState = (path, callback) => globalState.subscribe(path, callback);
