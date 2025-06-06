/**
 * DOM Renderer
 * Handles rendering virtual DOM nodes to real DOM elements
 */

export class DOMRenderer {
  constructor(security) {
    this.security = security;
  }

  /**
   * Renders a virtual DOM node to a real DOM element
   */
  render(vnode) {
    try {
      if (!vnode) {
        return document.createTextNode('');
      }

      if (vnode.type === 'text') {
        return document.createTextNode(vnode.content);
      }

      if (vnode.type === 'element') {
        return this.renderElement(vnode);
      }

      console.warn('Unknown vnode type:', vnode.type);
      return document.createTextNode('');

    } catch (error) {
      console.error('Critical error in render:', error);
      return document.createTextNode('[Critical Render Error]');
    }
  }

  /**
   * Render an element virtual node
   */
  renderElement(vnode) {
    let element;

    try {
      element = document.createElement(vnode.tag);
    } catch (error) {
      console.error(`Failed to create element with tag "${vnode.tag}":`, error);
      return document.createTextNode(`[Invalid element: ${vnode.tag}]`);
    }

    // Set attributes
    if (vnode.attrs && typeof vnode.attrs === 'object') {
      Object.entries(vnode.attrs).forEach(([key, value]) => {
        try {
          this.setAttribute(element, key, value);
        } catch (error) {
          console.error(`Failed to set attribute "${key}":`, error);
        }
      });
    }

    // Render and append children
    if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child, index) => {
        try {
          const childElement = this.render(child);
          if (childElement) {
            element.appendChild(childElement);
          }
        } catch (error) {
          console.error(`Failed to render child at index ${index}:`, error);
          const errorNode = document.createTextNode('[Render Error]');
          element.appendChild(errorNode);
        }
      });
    }

    return element;
  }

  /**
   * Sets an attribute on a DOM element with special handling
   */
  setAttribute(element, key, value) {
    if (!element || !key) {
      console.warn('Invalid element or key in setAttribute');
      return;
    }

    try {
      // Handle event listeners (functions only)
      if (key.startsWith('on') && typeof value === 'function') {
        this.setEventListener(element, key, value);
        return;
      }

      // Block string event handlers
      if (key.startsWith('on') && typeof value === 'string') {
        console.warn(`Blocked string event handler for security: ${key}`);
        return;
      }

      // Handle special properties
      if (this.setSpecialProperty(element, key, value)) {
        return;
      }

      // Handle boolean attributes
      if (typeof value === 'boolean') {
        if (value) {
          element.setAttribute(key, '');
        } else {
          element.removeAttribute(key);
        }
        return;
      }

      // Handle regular attributes
      if (value !== null && value !== undefined) {
        const stringValue = String(value);
        
        if (this.security.validateAttribute(key, stringValue)) {
          element.setAttribute(key, stringValue);
        }
      }
    } catch (error) {
      console.error(`Error setting attribute "${key}":`, error);
    }
  }

  /**
   * Set event listener with error handling
   */
  setEventListener(element, key, value) {
    const eventName = key.slice(2).toLowerCase();

    if (!/^[a-z]+$/.test(eventName)) {
      console.warn(`Invalid event name: ${eventName}`);
      return;
    }

    const safeHandler = (event) => {
      try {
        value(event);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    };

    element.addEventListener(eventName, safeHandler);
  }

  /**
   * Handle special DOM properties
   */
  setSpecialProperty(element, key, value) {
    switch (key) {
      case 'className':
        element.className = String(value || '');
        return true;
      case 'htmlFor':
        element.htmlFor = String(value || '');
        return true;
      case 'value':
        if ('value' in element) {
          element.value = String(value || '');
          return true;
        }
        break;
      case 'checked':
        if (element.type && (element.type === 'checkbox' || element.type === 'radio')) {
          element.checked = Boolean(value);
          return true;
        }
        break;
      case 'selected':
        if (element.tagName === 'OPTION') {
          element.selected = Boolean(value);
          return true;
        }
        break;
    }
    return false;
  }
}
