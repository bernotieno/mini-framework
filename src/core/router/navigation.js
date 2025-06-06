/**
 * Router Navigation
 * Handles navigation logic and history management
 */

import { PathUtils } from './path-utils.js';

export class Navigation {
  constructor(router) {
    this.router = router;
    this.isNavigating = false;
    this.navigationHistory = [];
    this.maxHistorySize = 50;
  }

  /**
   * Navigate to a route
   */
  navigate(path, options = {}) {
    if (this.isNavigating) {
      console.warn('Navigation already in progress');
      return;
    }

    // Validate path
    if (typeof path !== 'string') {
      console.error('Navigation path must be a string');
      return;
    }

    const sanitizedPath = PathUtils.sanitizePath(path);
    const currentPath = this.getCurrentPath();

    if (sanitizedPath === currentPath && !options.force) {
      return;
    }

    this.isNavigating = true;

    try {
      // Run before hooks
      const shouldContinue = this.router.runBeforeHooks(sanitizedPath, currentPath);
      if (!shouldContinue) {
        this.isNavigating = false;
        return;
      }

      // Add to navigation history
      this.addToHistory(sanitizedPath);

      // Update URL
      this.updateURL(sanitizedPath, options);

      // Handle the route change
      this.router.handleRouteChange();
    } catch (error) {
      console.error('Error during navigation:', error);
    } finally {
      this.isNavigating = false;
    }
  }

  /**
   * Update browser URL
   */
  updateURL(path, options) {
    if (this.router.mode === 'history') {
      try {
        if (options.replace) {
          history.replaceState(null, '', this.router.basePath + path);
        } else {
          history.pushState(null, '', this.router.basePath + path);
        }
      } catch (error) {
        console.error('Error updating browser history:', error);
        // Fallback to hash mode
        window.location.hash = path;
      }
    } else {
      window.location.hash = path;
    }
  }

  /**
   * Add path to navigation history
   */
  addToHistory(path) {
    this.navigationHistory.push({
      path,
      timestamp: Date.now()
    });

    // Limit history size
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory.shift();
    }
  }

  /**
   * Replace current route
   */
  replace(path) {
    this.navigate(path, { replace: true });
  }

  /**
   * Go back in history
   */
  back() {
    history.back();
  }

  /**
   * Go forward in history
   */
  forward() {
    history.forward();
  }

  /**
   * Get current path based on router mode
   */
  getCurrentPath() {
    if (this.router.mode === 'history') {
      let path = window.location.pathname;
      if (this.router.basePath) {
        path = path.replace(new RegExp(`^${this.router.basePath}`), '');
      }
      return PathUtils.normalizePath(path || '/');
    } else {
      return PathUtils.normalizePath(window.location.hash.slice(1) || '/');
    }
  }
}
