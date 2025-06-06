/**
 * Router Path Utilities
 * Functions for path manipulation, sanitization, and matching
 */

export class PathUtils {
  /**
   * Sanitize path to prevent path traversal and other security issues
   */
  static sanitizePath(path) {
    if (typeof path !== 'string') {
      return '/';
    }

    // Remove dangerous characters and sequences
    let sanitized = path
      .replace(/\.\./g, '') // Remove path traversal
      .replace(/[<>'"]/g, '') // Remove HTML/JS injection chars
      .replace(/\s+/g, '') // Remove whitespace
      .replace(/\/+/g, '/'); // Normalize multiple slashes

    // Ensure leading slash
    if (!sanitized.startsWith('/')) {
      sanitized = '/' + sanitized;
    }

    // Remove trailing slash (except for root)
    if (sanitized.length > 1 && sanitized.endsWith('/')) {
      sanitized = sanitized.slice(0, -1);
    }

    return sanitized;
  }

  /**
   * Normalize path (ensure leading slash, remove trailing slash)
   */
  static normalizePath(path) {
    if (!path || path === '/') return '/';
    
    // Ensure leading slash
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Remove trailing slash
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    return path;
  }

  /**
   * Convert route path to regex
   */
  static pathToRegex(path) {
    const regexPath = path
      .replace(/\//g, '\\/')
      .replace(/:([^\/]+)/g, '([^\/]+)');
    
    return new RegExp(`^${regexPath}$`);
  }

  /**
   * Extract parameter names from route path
   */
  static extractParamNames(path) {
    const matches = path.match(/:([^\/]+)/g);
    return matches ? matches.map(match => match.slice(1)) : [];
  }

  /**
   * Parse query parameters
   */
  static parseQuery() {
    const query = {};
    const queryString = window.location.search.slice(1);
    
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        query[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }
    
    return query;
  }
}
