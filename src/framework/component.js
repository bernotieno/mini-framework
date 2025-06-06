/**
 * Component System
 * Base component class and component utilities
 */

import { ReactiveState } from '../core/state.js';
import { vdom } from '../core/dom.js';
import { domEvents } from '../core/events.js';
import { subscribeToState } from '../core/state.js';
import { generateId } from '../utils.js';

/**
 * Component class for creating reusable UI components
 */
export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = new ReactiveState(this.getInitialState());
    this.element = null;
    this.mounted = false;
    this.subscriptions = [];
    this.eventCleanups = [];
    this.id = generateId('component');
  }

  /**
   * Get initial state for the component
   */
  getInitialState() {
    return {};
  }

  /**
   * Render method - must be implemented by subclasses
   */
  render() {
    throw new Error('Component must implement render() method');
  }

  /**
   * Mount the component to a DOM element
   */
  mount(container) {
    if (this.mounted) {
      console.warn('Component is already mounted');
      return;
    }

    this.container = container;
    this.beforeMount();
    
    // Subscribe to state changes for re-rendering
    this.subscriptions.push(
      this.state.subscribe(() => {
        this.update();
      })
    );

    // Initial render
    this.update();
    this.mounted = true;
    this.afterMount();
  }

  /**
   * Update the component
   */
  update() {
    if (!this.container) return;

    const vnode = this.render();
    vdom.mount(vnode, this.container);
    this.afterUpdate();
  }

  /**
   * Unmount the component
   */
  unmount() {
    if (!this.mounted) return;

    this.beforeUnmount();
    
    // Clean up subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];

    // Clean up event listeners
    this.eventCleanups.forEach(cleanup => cleanup());
    this.eventCleanups = [];

    this.mounted = false;
    this.afterUnmount();
  }

  /**
   * Set component state
   */
  setState(pathOrState, value) {
    this.state.set(pathOrState, value);
  }

  /**
   * Get component state
   */
  getState(path) {
    return this.state.get(path);
  }

  /**
   * Subscribe to global state
   */
  subscribeToGlobalState(path, callback) {
    const unsubscribe = subscribeToState(path, callback);
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Bind events to elements
   */
  bindEvents(element, eventMap) {
    const cleanup = domEvents.bindEvents(element, eventMap);
    this.eventCleanups.push(cleanup);
    return cleanup;
  }

  // Lifecycle hooks (can be overridden)
  beforeMount() {}
  afterMount() {}
  beforeUpdate() {}
  afterUpdate() {}
  beforeUnmount() {}
  afterUnmount() {}
}

/**
 * Create a component from a definition object
 */
export function defineComponent(definition) {
  class CustomComponent extends Component {
    getInitialState() {
      return definition.state || {};
    }

    render() {
      return definition.render.call(this);
    }

    beforeMount() {
      if (definition.beforeMount) {
        definition.beforeMount.call(this);
      }
    }

    afterMount() {
      if (definition.afterMount) {
        definition.afterMount.call(this);
      }
    }

    beforeUpdate() {
      if (definition.beforeUpdate) {
        definition.beforeUpdate.call(this);
      }
    }

    afterUpdate() {
      if (definition.afterUpdate) {
        definition.afterUpdate.call(this);
      }
    }

    beforeUnmount() {
      if (definition.beforeUnmount) {
        definition.beforeUnmount.call(this);
      }
    }

    afterUnmount() {
      if (definition.afterUnmount) {
        definition.afterUnmount.call(this);
      }
    }
  }

  // Copy methods from definition
  Object.keys(definition).forEach(key => {
    if (typeof definition[key] === 'function' && 
        !['render', 'state', 'beforeMount', 'afterMount', 'beforeUpdate', 'afterUpdate', 'beforeUnmount', 'afterUnmount'].includes(key)) {
      CustomComponent.prototype[key] = definition[key];
    }
  });

  return CustomComponent;
}
