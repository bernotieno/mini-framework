/**
 * Route Matcher
 * Handles route definition, storage, and matching
 */

import { PathUtils } from './path-utils.js';

export class RouteMatcher {
  constructor() {
    this.routes = new Map();
    this.maxRoutes = 1000;
  }

  /**
   * Define a route
   */
  route(path, handler, options = {}) {
    // Validate inputs
    if (typeof path !== 'string') {
      console.error('Route path must be a string');
      return this;
    }

    if (typeof handler !== 'function' && typeof handler !== 'object') {
      console.error('Route handler must be a function or object');
      return this;
    }

    // Check route limit
    if (this.routes.size >= this.maxRoutes) {
      console.warn(`Maximum routes (${this.maxRoutes}) reached. Route ignored.`);
      return this;
    }

    const sanitizedPath = PathUtils.sanitizePath(path);

    try {
      const route = {
        path: sanitizedPath,
        handler,
        options: { ...options },
        regex: PathUtils.pathToRegex(sanitizedPath),
        paramNames: PathUtils.extractParamNames(sanitizedPath),
        createdAt: Date.now()
      };

      this.routes.set(sanitizedPath, route);
    } catch (error) {
      console.error(`Error creating route for path "${path}":`, error);
    }

    return this;
  }

  /**
   * Match a path against defined routes
   */
  matchRoute(path) {
    for (const [routePath, route] of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((paramName, index) => {
          params[paramName] = match[index + 1];
        });

        return {
          ...route,
          params,
          query: PathUtils.parseQuery(),
          path: routePath,
          matchedPath: path
        };
      }
    }
    return null;
  }

  /**
   * Get all routes
   */
  getRoutes() {
    return this.routes;
  }
}
