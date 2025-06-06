/**
 * Virtual Node Creator
 * Handles creation and validation of virtual DOM nodes
 */

export class VNodeCreator {
  constructor(security, maxDepth) {
    this.security = security;
    this.maxDepth = maxDepth;
  }

  /**
   * Creates a virtual DOM node from a JSON-like structure
   */
  createElement(vnode, depth = 0) {
    // Prevent infinite recursion
    if (depth > this.maxDepth) {
      console.warn(`Maximum DOM depth (${this.maxDepth}) exceeded. Truncating tree.`);
      return null;
    }

    // Handle text nodes
    if (typeof vnode === 'string' || typeof vnode === 'number') {
      const content = String(vnode);
      const escapedContent = this.security.escapeHtml(content);
      return {
        type: 'text',
        content: escapedContent
      };
    }

    // Handle null/undefined
    if (!vnode) {
      return null;
    }

    // Handle arrays of children
    if (Array.isArray(vnode)) {
      if (vnode.length > 1000) {
        console.warn('Large array of children detected. This may impact performance.');
      }
      return vnode.map(child => this.createElement(child, depth + 1)).filter(Boolean);
    }

    // Validate input object
    if (typeof vnode !== 'object') {
      console.error('Invalid vnode type:', typeof vnode);
      return null;
    }

    return this.createElementNode(vnode, depth);
  }

  /**
   * Create an element virtual node
   */
  createElementNode(vnode, depth) {
    const { tag, attrs = {}, children = [] } = vnode;

    if (!tag) {
      throw new Error('Virtual DOM node must have a tag property');
    }

    if (typeof tag !== 'string') {
      throw new Error('Tag must be a string');
    }

    const normalizedTag = tag.toLowerCase().trim();

    // Security: Only allow safe HTML tags
    if (!this.security.isTagAllowed(normalizedTag)) {
      console.warn(`Potentially unsafe tag "${normalizedTag}" blocked. Using div instead.`);
      return this.createElement({ tag: 'div', attrs, children }, depth);
    }

    // Validate and sanitize attributes
    const sanitizedAttrs = this.security.sanitizeAttributes(attrs);

    return {
      type: 'element',
      tag: normalizedTag,
      attrs: sanitizedAttrs,
      children: Array.isArray(children)
        ? children.map(child => this.createElement(child, depth + 1)).filter(Boolean)
        : [this.createElement(children, depth + 1)].filter(Boolean)
    };
  }
}

/**
 * Helper function to create virtual DOM elements
 */
export function h(tag, attrs = {}, ...children) {
  return {
    tag,
    attrs,
    children: children.flat()
  };
}
