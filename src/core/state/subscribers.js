/**
 * State Subscribers Manager
 * Handles subscription management and notifications
 */

import { eventEmitter } from '../events.js';

export class SubscribersManager {
  constructor(maxSubscribers = 1000, maxUpdatesPerCycle = 100) {
    this.subscribers = new Map();
    this.maxSubscribers = maxSubscribers;
    this.isUpdating = false;
    this.pendingUpdates = new Set();
    this.updateCount = 0;
    this.maxUpdatesPerCycle = maxUpdatesPerCycle;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(pathOrCallback, callback) {
    let path, cb;

    if (typeof pathOrCallback === 'function') {
      path = '*';
      cb = pathOrCallback;
    } else if (typeof pathOrCallback === 'string') {
      path = pathOrCallback;
      cb = callback;
    } else {
      console.error('Invalid subscription path type:', typeof pathOrCallback);
      return () => {};
    }

    if (typeof cb !== 'function') {
      console.error('Callback must be a function');
      return () => {};
    }

    // Check subscriber limit
    const totalSubscribers = Array.from(this.subscribers.values())
      .reduce((total, set) => total + set.size, 0);

    if (totalSubscribers >= this.maxSubscribers) {
      console.warn(`Maximum subscribers (${this.maxSubscribers}) reached. Subscription ignored.`);
      return () => {};
    }

    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }

    const subscriber = {
      callback: cb,
      id: Symbol('subscriber'),
      createdAt: Date.now()
    };

    this.subscribers.get(path).add(subscriber);

    // Return unsubscribe function
    return () => {
      try {
        const pathSubscribers = this.subscribers.get(path);
        if (pathSubscribers) {
          pathSubscribers.delete(subscriber);
          if (pathSubscribers.size === 0) {
            this.subscribers.delete(path);
          }
        }
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    };
  }

  /**
   * Notify subscribers of state changes
   */
  notifySubscribers(state, getValue, changedPath = '*') {
    if (this.isUpdating) {
      this.pendingUpdates.add(changedPath);
      return;
    }

    // Prevent infinite update loops
    this.updateCount++;
    if (this.updateCount > this.maxUpdatesPerCycle) {
      console.error(`Maximum updates per cycle (${this.maxUpdatesPerCycle}) exceeded. Possible infinite loop detected.`);
      this.updateCount = 0;
      this.pendingUpdates.clear();
      return;
    }

    this.isUpdating = true;

    try {
      // Notify specific path subscribers
      if (changedPath !== '*' && this.subscribers.has(changedPath)) {
        this.notifyPathSubscribers(changedPath, getValue);
      }

      // Notify global subscribers
      if (this.subscribers.has('*')) {
        this.notifyGlobalSubscribers(state, changedPath);
      }

      // Emit global state change event
      try {
        eventEmitter.emit('state:change', {
          state,
          changedPath
        });
      } catch (error) {
        console.error('Error emitting state change event:', error);
      }

    } finally {
      this.isUpdating = false;
    }

    // Process any pending updates
    if (this.pendingUpdates.size > 0) {
      const pending = Array.from(this.pendingUpdates);
      this.pendingUpdates.clear();

      setTimeout(() => {
        pending.forEach(path => this.notifySubscribers(state, getValue, path));
        this.updateCount = 0;
      }, 0);
    } else {
      this.updateCount = 0;
    }
  }

  /**
   * Notify subscribers for a specific path
   */
  notifyPathSubscribers(changedPath, getValue) {
    const pathSubscribers = this.subscribers.get(changedPath);
    const subscribersToRemove = [];

    pathSubscribers.forEach(subscriber => {
      try {
        subscriber.callback(getValue(changedPath), changedPath);
      } catch (error) {
        console.error(`Error in state subscriber for path "${changedPath}":`, error);
        if (error.name === 'TypeError' || error.name === 'ReferenceError') {
          subscribersToRemove.push(subscriber);
        }
      }
    });

    // Remove problematic subscribers
    subscribersToRemove.forEach(subscriber => {
      pathSubscribers.delete(subscriber);
      console.warn('Removed problematic subscriber');
    });
  }

  /**
   * Notify global subscribers
   */
  notifyGlobalSubscribers(state, changedPath) {
    const globalSubscribers = this.subscribers.get('*');
    const subscribersToRemove = [];

    globalSubscribers.forEach(subscriber => {
      try {
        subscriber.callback(state, changedPath);
      } catch (error) {
        console.error('Error in global state subscriber:', error);
        if (error.name === 'TypeError' || error.name === 'ReferenceError') {
          subscribersToRemove.push(subscriber);
        }
      }
    });

    // Remove problematic subscribers
    subscribersToRemove.forEach(subscriber => {
      globalSubscribers.delete(subscriber);
      console.warn('Removed problematic global subscriber');
    });
  }
}
