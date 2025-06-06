/**
 * DOM Abstraction Layer
 * Main VirtualDOM class that coordinates all DOM operations
 */

import { DOMSecurity } from './dom/security.js';
import { DOMRenderer } from './dom/renderer.js';
import { VNodeCreator } from './dom/vnode.js';

export class VirtualDOM {
  constructor() {
    this.currentTree = null;
    this.rootElement = null;
    this.maxDepth = 100;

    // Initialize sub-modules
    this.security = new DOMSecurity();
    this.renderer = new DOMRenderer(this.security);
    this.vnodeCreator = new VNodeCreator(this.security, this.maxDepth);
  }

  /**
   * Creates a virtual DOM node from a JSON-like structure
   */
  createElement(vnode, depth = 0) {
    return this.vnodeCreator.createElement(vnode, depth);
  }

  /**
   * Renders a virtual DOM node to a real DOM element
   */
  render(vnode) {
    return this.renderer.render(vnode);
  }

  /**
   * Mounts the virtual DOM tree to a real DOM element
   */
  mount(vnode, container) {
    if (!container || !container.nodeType) {
      throw new Error('Invalid container element provided to mount()');
    }

    if (container.nodeType !== Node.ELEMENT_NODE) {
      throw new Error('Container must be an Element node');
    }

    try {
      const element = this.render(this.createElement(vnode));

      // Clear container safely
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      if (element) {
        container.appendChild(element);
      }

      this.currentTree = vnode;
      this.rootElement = container;

    } catch (error) {
      console.error('Error mounting virtual DOM:', error);
      // Create error message element
      const errorElement = document.createElement('div');
      errorElement.style.color = 'red';
      errorElement.style.padding = '10px';
      errorElement.style.border = '1px solid red';
      errorElement.textContent = 'Error rendering component. Check console for details.';

      container.innerHTML = '';
      container.appendChild(errorElement);
      throw error;
    }
  }

  /**
   * Updates the DOM with a new virtual DOM tree
   */
  update(newVnode) {
    if (!this.rootElement) {
      throw new Error('No root element mounted. Call mount() first.');
    }

    if (!this.rootElement.isConnected) {
      console.warn('Root element is no longer in the document. Skipping update.');
      return;
    }

    try {
      // For simplicity, we'll do a full re-render
      this.mount(newVnode, this.rootElement);
    } catch (error) {
      console.error('Error updating virtual DOM:', error);
      throw error;
    }
  }

  /**
   * Safely unmount the virtual DOM tree
   */
  unmount() {
    if (this.rootElement) {
      try {
        while (this.rootElement.firstChild) {
          this.rootElement.removeChild(this.rootElement.firstChild);
        }
      } catch (error) {
        console.error('Error during unmount:', error);
      }

      this.currentTree = null;
      this.rootElement = null;
    }
  }
}

// Export a default instance
export const vdom = new VirtualDOM();

// Export the helper function
export { h } from './dom/vnode.js';
