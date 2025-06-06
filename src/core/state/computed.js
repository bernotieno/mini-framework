/**
 * Computed Values Manager
 * Handles computed state values and their dependencies
 */

export class ComputedManager {
  constructor() {
    this.computedCache = new Map();
    this.computedDependencies = new Map();
  }

  /**
   * Create a computed value that automatically updates when dependencies change
   */
  computed(name, computeFn, dependencies = [], subscribeToState) {
    this.computedDependencies.set(name, dependencies);
    
    // Initial computation
    this.computedCache.set(name, computeFn());

    // Subscribe to dependency changes
    dependencies.forEach(dep => {
      subscribeToState(dep, () => {
        const newValue = computeFn();
        const oldValue = this.computedCache.get(name);
        
        if (newValue !== oldValue) {
          this.computedCache.set(name, newValue);
          // Notify computed value subscribers
          subscribeToState(`computed.${name}`, () => {});
        }
      });
    });

    return () => this.computedCache.get(name);
  }

  /**
   * Get a computed value
   */
  getComputed(name) {
    return this.computedCache.get(name);
  }

  /**
   * Clear all computed values
   */
  clear() {
    this.computedCache.clear();
    this.computedDependencies.clear();
  }
}
