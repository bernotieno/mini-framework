/**
 * Application System
 * Main application class and app utilities
 */

import { router } from '../core/router.js';
import { eventEmitter } from '../core/events.js';

/**
 * Application class for managing the entire app
 */
export class Application {
  constructor(options = {}) {
    this.options = options;
    this.components = new Map();
    this.plugins = [];
    this.initialized = false;
  }

  /**
   * Initialize the application
   */
  init(rootElement) {
    if (this.initialized) {
      console.warn('Application is already initialized');
      return;
    }

    this.rootElement = rootElement;
    
    // Initialize router if routes are provided
    if (this.options.routes) {
      this.setupRoutes(this.options.routes);
    }

    // Initialize plugins
    this.plugins.forEach(plugin => {
      if (typeof plugin.init === 'function') {
        plugin.init(this);
      }
    });

    this.initialized = true;
    
    // Emit app ready event
    eventEmitter.emit('app:ready', this);
  }

  /**
   * Setup routes
   */
  setupRoutes(routes) {
    Object.entries(routes).forEach(([path, handler]) => {
      router.route(path, handler);
    });
  }

  /**
   * Register a component
   */
  component(name, component) {
    this.components.set(name, component);
  }

  /**
   * Create a component instance
   */
  createComponent(name, props = {}) {
    const ComponentClass = this.components.get(name);
    if (!ComponentClass) {
      throw new Error(`Component '${name}' not found`);
    }
    return new ComponentClass(props);
  }

  /**
   * Use a plugin
   */
  use(plugin) {
    this.plugins.push(plugin);
    
    if (this.initialized && typeof plugin.init === 'function') {
      plugin.init(this);
    }
  }

  /**
   * Navigate to a route
   */
  navigate(path, options) {
    router.navigate(path, options);
  }

  /**
   * Get current route
   */
  getCurrentRoute() {
    return router.getCurrentRoute();
  }
}

/**
 * Create a new application instance
 */
export function createApp(options = {}) {
  return new Application(options);
}
