/**
 * DOM Security Module
 * Handles XSS protection, attribute sanitization, and security validation
 */

export class DOMSecurity {
  constructor() {
    this.allowedTags = new Set([
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
      'form', 'input', 'button', 'textarea', 'select', 'option',
      'header', 'footer', 'main', 'section', 'article', 'nav',
      'aside', 'figure', 'figcaption', 'time', 'mark', 'small',
      'strong', 'em', 'code', 'pre', 'blockquote', 'cite',
      'label', 'fieldset', 'legend', 'details', 'summary'
    ]);
  }

  /**
   * Escape HTML entities to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Validate if a tag is safe to use
   */
  isTagAllowed(tag) {
    return this.allowedTags.has(tag.toLowerCase().trim());
  }

  /**
   * Sanitize attributes to prevent XSS and other security issues
   */
  sanitizeAttributes(attrs) {
    if (!attrs || typeof attrs !== 'object') {
      return {};
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(attrs)) {
      if (typeof key !== 'string' || key.trim() === '') {
        console.warn('Invalid attribute name:', key);
        continue;
      }

      const normalizedKey = key.toLowerCase().trim();

      // Block dangerous attributes that could contain scripts
      if (normalizedKey.startsWith('on') && typeof value === 'string') {
        console.warn(`Blocked potentially dangerous attribute: ${normalizedKey}`);
        continue;
      }

      // Block javascript: URLs
      if ((normalizedKey === 'href' || normalizedKey === 'src') &&
          typeof value === 'string' &&
          value.toLowerCase().trim().startsWith('javascript:')) {
        console.warn(`Blocked javascript: URL in ${normalizedKey}`);
        continue;
      }

      // Block unsafe data: URLs
      if (normalizedKey === 'src' && typeof value === 'string') {
        const lowerValue = value.toLowerCase().trim();
        if (lowerValue.startsWith('data:') &&
            !lowerValue.startsWith('data:image/')) {
          console.warn('Blocked potentially unsafe data: URL');
          continue;
        }
      }

      // Validate style attribute
      if (normalizedKey === 'style' && typeof value === 'string') {
        sanitized[normalizedKey] = this.sanitizeStyle(value);
        continue;
      }

      sanitized[normalizedKey] = value;
    }

    return sanitized;
  }

  /**
   * Sanitize CSS style string
   */
  sanitizeStyle(style) {
    if (typeof style !== 'string') return '';

    const dangerous = [
      'expression', 'javascript:', 'vbscript:', 'data:',
      'behavior:', '-moz-binding', 'import'
    ];

    let sanitized = style;
    dangerous.forEach(danger => {
      const regex = new RegExp(danger, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
  }

  /**
   * Validate attribute values for specific security checks
   */
  validateAttribute(key, value) {
    if (key === 'id' && !/^[a-zA-Z][\w-]*$/.test(String(value))) {
      console.warn(`Invalid ID format: ${value}`);
      return false;
    }

    if (key === 'class' && String(value).includes('<')) {
      console.warn('Potentially unsafe class value blocked');
      return false;
    }

    return true;
  }
}
