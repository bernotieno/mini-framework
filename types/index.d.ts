// Type definitions for Mini Framework
// Project: Mini Framework
// Definitions by: Mini Framework Team

export interface VirtualNode {
  tag: string;
  attrs: Record<string, any>;
  children: (VirtualNode | string)[];
}

export interface RouteParams {
  [key: string]: string;
}

export interface RouteQuery {
  [key: string]: string;
}

export interface Route {
  params: RouteParams;
  query: RouteQuery;
  path: string;
  matchedPath: string;
}

export interface ComponentProps {
  [key: string]: any;
}

export interface ComponentState {
  [key: string]: any;
}

export declare class Component {
  props: ComponentProps;
  state: ReactiveState;
  element: Element | null;
  mounted: boolean;
  id: string;

  constructor(props?: ComponentProps);
  getInitialState(): ComponentState;
  render(): VirtualNode;
  mount(container: Element): void;
  update(): void;
  unmount(): void;
  setState(pathOrState: string | ComponentState, value?: any): void;
  getState(path?: string): any;
  subscribeToGlobalState(path: string, callback: Function): Function;
  bindEvents(element: Element, eventMap: Record<string, Function>): Function;

  // Lifecycle hooks
  beforeMount(): void;
  afterMount(): void;
  beforeUpdate(): void;
  afterUpdate(): void;
  beforeUnmount(): void;
  afterUnmount(): void;
}

export declare class Application {
  constructor(options?: any);
  init(rootElement: Element): void;
  setupRoutes(routes: Record<string, Function>): void;
  component(name: string, component: typeof Component): void;
  createComponent(name: string, props?: ComponentProps): Component;
  use(plugin: any): void;
  navigate(path: string, options?: any): void;
  getCurrentRoute(): Route | null;
}

export declare class VirtualDOM {
  mount(vnode: VirtualNode, container: Element): void;
  createElement(vnode: VirtualNode): Element;
  updateElement(container: Element, newVnode: VirtualNode, oldVnode?: VirtualNode): void;
}

export declare class EventEmitter {
  on(eventName: string, callback: Function): Function;
  once(eventName: string, callback: Function): Function;
  emit(eventName: string, ...args: any[]): void;
  off(eventName: string, callback?: Function): void;
  removeAllListeners(eventName?: string): void;
  eventNames(): string[];
  listenerCount(eventName: string): number;
}

export declare class ReactiveState {
  constructor(initialState?: any);
  get(path?: string): any;
  set(pathOrState: string | any, value?: any): void;
  update(path: string, updater: Function): void;
  subscribe(pathOrCallback: string | Function, callback?: Function): Function;
  unsubscribe(path: string, callback: Function): void;
  action(name: string, actionFn: Function): Function;
  computed(name: string, computeFn: Function, dependencies: string[]): any;
}

export declare class Router {
  route(path: string, handler: Function): void;
  navigate(path: string, options?: any): void;
  getCurrentRoute(): Route | null;
  beforeEach(hook: Function): void;
  afterEach(hook: Function): void;
}

// Helper functions
export declare function h(tag: string, attrs?: Record<string, any>, children?: (VirtualNode | string)[]): VirtualNode;
export declare function createApp(options?: any): Application;
export declare function defineComponent(definition: any): typeof Component;

// State helpers
export declare function useState(initialState?: any): ReactiveState;
export declare function getState(path?: string): any;
export declare function setState(pathOrState: string | any, value?: any): void;
export declare function updateState(path: string, updater: Function): void;
export declare function subscribeToState(path: string, callback: Function): Function;

// Utility functions
export declare function debounce(func: Function, delay: number): Function;
export declare function throttle(func: Function, limit: number): Function;
export declare function generateId(prefix?: string): string;
export declare function isEmpty(value: any): boolean;

// Default instances
export declare const vdom: VirtualDOM;
export declare const eventEmitter: EventEmitter;
export declare const globalState: ReactiveState;
export declare const router: Router;
export declare const domEvents: any;
export declare const validators: any;
export declare const storage: any;
export declare const EventBus: any;
