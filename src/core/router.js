/**
 * Client-side Router
 * Main router class that coordinates navigation, route matching, and hooks
 */

import { eventEmitter } from './events.js';
import { globalState } from './state.js';
import { PathUtils } from './router/path-utils.js';
import { Navigation } from './router/navigation.js';
import { RouteMatcher } from './router/route-matcher.js';

export class Router {
  constructor(options = {}) {
    this.currentRoute = null;
    this.basePath = PathUtils.sanitizePath(options.basePath || '');
    this.mode = ['history', 'hash'].includes(options.mode) ? options.mode : 'history';
    this.defaultRoute = PathUtils.sanitizePath(options.defaultRoute || '/');
    this.notFoundRoute = options.notFoundRoute || null;

    this.beforeHooks = [];
    this.afterHooks = [];
    this.maxHooks = 100;

    // Initialize sub-modules
    this.navigation = new Navigation(this);
    this.routeMatcher = new RouteMatcher();

    this.init();
  }

  /**
   * Define a route
   */
  route(path, handler, options = {}) {
    return this.routeMatcher.route(path, handler, options);
  }

  /**
   * Initialize the router
   */
  init() {
    try {
      // Set up event listeners
      if (this.mode === 'history') {
        window.addEventListener('popstate', () => {
          this.handleRouteChange();
        });
      } else {
        window.addEventListener('hashchange', () => {
          this.handleRouteChange();
        });
      }

      // Handle initial route
      this.handleRouteChange();
    } catch (error) {
      console.error('Error initializing router:', error);
    }
  }

  /**
   * Navigate to a route
   */
  navigate(path, options = {}) {
    this.navigation.navigate(path, options);
  }

  /**
   * Replace current route
   */
  replace(path) {
    this.navigation.replace(path);
  }

  /**
   * Go back in history
   */
  back() {
    this.navigation.back();
  }

  /**
   * Go forward in history
   */
  forward() {
    this.navigation.forward();
  }

  /**
   * Handle route changes
   */
  handleRouteChange() {
    const path = this.getCurrentPath();
    const matchedRoute = this.routeMatcher.matchRoute(path);

    if (matchedRoute) {
      this.activateRoute(matchedRoute, path);
    } else if (this.notFoundRoute) {
      this.activateRoute(this.notFoundRoute, path);
    } else {
      console.warn(`No route found for path: ${path}`);
    }
  }

  /**
   * Activate a matched route
   * @param {Object} matchedRoute - Matched route object
   * @param {string} path - Current path
   */
  activateRoute(matchedRoute, path) {
    const previousRoute = this.currentRoute;
    this.currentRoute = matchedRoute;

    // Update global state
    globalState.set('router', {
      currentRoute: matchedRoute,
      path,
      params: matchedRoute.params || {},
      query: matchedRoute.query || {}
    });

    // Execute route handler
    if (typeof matchedRoute.handler === 'function') {
      try {
        matchedRoute.handler(matchedRoute);
      } catch (error) {
        console.error('Error in route handler:', error);
      }
    }

    // Emit route change events
    eventEmitter.emit('route:change', {
      current: matchedRoute,
      previous: previousRoute,
      path
    });

    eventEmitter.emit(`route:enter:${matchedRoute.path}`, matchedRoute);

    if (previousRoute) {
      eventEmitter.emit(`route:leave:${previousRoute.path}`, previousRoute);
    }

    // Run after hooks
    this.runAfterHooks(matchedRoute, previousRoute);
  }

  /**
   * Get current path based on router mode
   */
  getCurrentPath() {
    return this.navigation.getCurrentPath();
  }

  /**
   * Add a before navigation hook
   * @param {Function} hook - Hook function
   */
  beforeEach(hook) {
    this.beforeHooks.push(hook);
  }

  /**
   * Add an after navigation hook
   * @param {Function} hook - Hook function
   */
  afterEach(hook) {
    this.afterHooks.push(hook);
  }

  /**
   * Run before hooks
   * @param {string} to - Target path
   * @param {string} from - Current path
   * @returns {boolean} Whether to continue navigation
   */
  runBeforeHooks(to, from) {
    for (const hook of this.beforeHooks) {
      try {
        const result = hook(to, from);
        if (result === false) {
          return false;
        }
      } catch (error) {
        console.error('Error in before hook:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Run after hooks
   * @param {Object} to - Target route
   * @param {Object} from - Previous route
   */
  runAfterHooks(to, from) {
    this.afterHooks.forEach(hook => {
      try {
        hook(to, from);
      } catch (error) {
        console.error('Error in after hook:', error);
      }
    });
  }

  /**
   * Get current route information
   * @returns {Object} Current route info
   */
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Export default router instance
export const router = new Router();
