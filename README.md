# Mini Framework

A lightweight, zero-dependency JavaScript framework built from scratch. Mini Framework provides all the essential features you need to build modern web applications without the bloat of larger frameworks.

## Features

- 🎯 **Virtual DOM** - Efficient DOM rendering and updates
- 🎪 **Custom Event System** - Pub-sub pattern without addEventListener
- 🔄 **Reactive State Management** - Global state with automatic UI updates
- 🛣️ **Client-side Routing** - Hash and history-based navigation
- 📦 **Zero Dependencies** - No external libraries required
- 🧩 **Component System** - Reusable UI components
- 💾 **Local Storage Integration** - Built-in persistence helpers
- 🔧 **Utility Functions** - Common helpers included

## Installation

### NPM Installation

```bash
npm install @bernotieno/mini-framework
```

### CDN Usage

```html
<script type="module">
  import { createApp, h, defineComponent } from 'https://unpkg.com/@bernotieno/mini-framework/src/framework.js';
  // Your app code here
</script>
```

## Quick Start

### Using NPM

```javascript
import { createApp, defineComponent, h } from '@bernotieno/mini-framework';

const HelloWorld = defineComponent({
  render() {
    return h('div', {}, [
      h('h1', {}, 'Hello, Mini Framework!'),
      h('p', {}, 'Built with zero dependencies')
    ]);
  }
});

const app = createApp();
const component = new HelloWorld();
component.mount(document.getElementById('app'));
```

### Development Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open `http://localhost:3000/examples/todomvc/` to see the TodoMVC demo

## How the Framework Works

Mini Framework is built from scratch using vanilla JavaScript with zero dependencies. Here's how each core system works internally:

### Architecture Overview

The framework consists of four main modules:

1. **Virtual DOM Engine** (`src/core/dom.js`) - Converts JSON-like structures to real DOM elements
2. **Event System** (`src/core/events.js`) - Custom pub-sub pattern replacing addEventListener
3. **State Management** (`src/core/state.js`) - Reactive state store with automatic UI updates
4. **Router** (`src/core/router.js`) - Client-side navigation with URL synchronization

### Virtual DOM Implementation

The Virtual DOM system works by:
1. Creating lightweight JavaScript objects representing DOM structure
2. Rendering these objects to real DOM elements when needed
3. Providing a simple `h()` function for element creation
4. Supporting nested elements, attributes, and event handlers

### Event System Architecture

Instead of relying on `addEventListener`, the framework implements:
1. A custom EventEmitter class with pub-sub pattern
2. DOM event delegation for efficient event handling
3. Declarative event binding through element attributes
4. Global event communication between components

### Reactive State Management

The state system provides:
1. Global state store with dot-notation path access
2. Automatic subscriber notification on state changes
3. Component-level state isolation
4. Action pattern for complex state mutations

### Router Implementation

The routing system handles:
1. URL parsing and route matching with parameters
2. History API integration for clean URLs
3. Hash-based fallback for broader compatibility
4. Navigation hooks for route guards and side effects

## Core Concepts

### 1. Virtual DOM

The framework uses a JSON-like structure to represent DOM elements:

```javascript
import { h, vdom } from '@bernotieno/mini-framework';

// Create virtual DOM elements
const element = h('div', { class: 'container' }, [
    h('h1', {}, 'Hello World'),
    h('p', { id: 'description' }, 'This is a paragraph')
]);

// Mount to real DOM
vdom.mount(element, document.getElementById('app'));
```

#### Virtual DOM Structure

```javascript
{
    tag: 'div',
    attrs: { class: 'example', id: 'my-div' },
    children: [
        'Text content',
        {
            tag: 'span',
            attrs: { style: 'color: red' },
            children: ['Nested content']
        }
    ]
}
```

### 2. Custom Event System

Instead of `addEventListener`, the framework uses a custom pub-sub event system:

```javascript
import { eventEmitter, domEvents } from '@bernotieno/mini-framework';

// Global event emitter
eventEmitter.on('custom-event', (data) => {
    console.log('Event received:', data);
});

eventEmitter.emit('custom-event', { message: 'Hello!' });

// DOM event binding
const element = document.querySelector('#my-button');
domEvents.bind(element, 'click', (e) => {
    console.log('Button clicked!');
});

// Declarative event binding
domEvents.bindEvents(element, {
    click: () => console.log('Clicked!'),
    mouseover: () => console.log('Hovered!')
});
```

### 3. Reactive State Management

Global state that automatically triggers UI updates:

```javascript
import { globalState, subscribeToState } from '@bernotieno/mini-framework';

// Set state
globalState.set('user', { name: 'John', age: 30 });
globalState.set('user.name', 'Jane'); // Nested updates

// Get state
const user = globalState.get('user');
const userName = globalState.get('user.name');

// Subscribe to changes
const unsubscribe = subscribeToState('user', (user) => {
    console.log('User changed:', user);
});

// Update with function
globalState.update('user.age', age => age + 1);

// Actions for complex state changes
const userActions = {
    updateProfile: globalState.action('updateProfile', (state, newData) => {
        state.set('user', { ...state.get('user'), ...newData });
    })
};
```

### 4. Client-side Routing

Simple routing with URL synchronization:

```javascript
import { router } from '@bernotieno/mini-framework';

// Define routes
router.route('/', () => {
    console.log('Home page');
});

router.route('/users/:id', (route) => {
    console.log('User ID:', route.params.id);
});

router.route('/products', () => {
    console.log('Products page');
});

// Navigate programmatically
router.navigate('/users/123');
router.navigate('/products', { replace: true });

// Navigation hooks
router.beforeEach((to, from) => {
    console.log(`Navigating from ${from} to ${to}`);
    return true; // Return false to cancel navigation
});

router.afterEach((to, from) => {
    console.log('Navigation completed');
});
```

## Component System

Create reusable components using the `defineComponent` function:

```javascript
import { defineComponent, h } from '@bernotieno/mini-framework';

const UserCard = defineComponent({
    // Initial component state
    state: {
        expanded: false
    },

    // Lifecycle hooks
    afterMount() {
        console.log('Component mounted');
    },

    beforeUnmount() {
        console.log('Component will unmount');
    },

    // Methods
    toggleExpanded() {
        this.setState('expanded', !this.getState('expanded'));
    },

    // Render method
    render() {
        const { user } = this.props;
        const expanded = this.getState('expanded');

        return h('div', { class: 'user-card' }, [
            h('h3', {}, user.name),
            h('button', {
                onclick: () => this.toggleExpanded()
            }, expanded ? 'Collapse' : 'Expand'),
            expanded ? h('div', { class: 'details' }, [
                h('p', {}, `Age: ${user.age}`),
                h('p', {}, `Email: ${user.email}`)
            ]) : null
        ]);
    }
});

// Use the component
const userCard = new UserCard({ user: { name: 'John', age: 30, email: 'john@example.com' } });
userCard.mount(document.getElementById('container'));
```

## Application Setup

Create and initialize your application:

```javascript
import { createApp } from '@bernotieno/mini-framework';

const app = createApp({
    routes: {
        '/': () => console.log('Home'),
        '/about': () => console.log('About'),
        '/contact': () => console.log('Contact')
    }
});

// Initialize the app
app.init(document.getElementById('app'));

// Register components
app.component('UserCard', UserCard);

// Create component instances
const userCard = app.createComponent('UserCard', { user: userData });
```

## Utility Functions

The framework includes helpful utility functions:

```javascript
import { debounce, throttle, storage, validators } from '@bernotieno/mini-framework';

// Debounce function calls
const debouncedSearch = debounce((query) => {
    console.log('Searching for:', query);
}, 300);

// Throttle function calls
const throttledScroll = throttle(() => {
    console.log('Scrolling...');
}, 100);

// Local storage helpers
storage.set('user', { name: 'John' });
const user = storage.get('user');
storage.remove('user');

// Validation
const isValidEmail = validators.email('test@example.com'); // true
const isRequired = validators.required(''); // false
const hasMinLength = validators.minLength(5)('hello'); // true
```

## Event Handling Examples

### Basic Event Binding

```javascript
// In component render method
h('button', {
    onclick: (e) => {
        console.log('Button clicked!');
        e.preventDefault();
        e.stopPropagation();
    }
}, 'Click me')

// Multiple events
h('input', {
    oninput: (e) => this.setState('value', e.target.value),
    onkeydown: (e) => {
        if (e.originalEvent.key === 'Enter') {
            this.handleSubmit();
        }
    },
    onblur: () => this.handleBlur()
})
```

### Custom Events

```javascript
import { eventEmitter } from '@bernotieno/mini-framework';

// Component A emits an event
eventEmitter.emit('user-updated', { id: 123, name: 'John' });

// Component B listens for the event
eventEmitter.on('user-updated', (userData) => {
    console.log('User updated:', userData);
});

// One-time listener
eventEmitter.once('app-ready', () => {
    console.log('App is ready!');
});
```

## State Management Patterns

### Local Component State

```javascript
const Counter = defineComponent({
    state: {
        count: 0
    },

    increment() {
        this.setState('count', this.getState('count') + 1);
    },

    render() {
        return h('div', {}, [
            h('span', {}, `Count: ${this.getState('count')}`),
            h('button', { onclick: () => this.increment() }, '+')
        ]);
    }
});
```

### Global State with Actions

```javascript
import { globalState } from '@bernotieno/mini-framework';

// Define actions
const counterActions = {
    increment: globalState.action('increment', (state) => {
        const count = state.get('counter.count') || 0;
        state.set('counter.count', count + 1);
    }),

    decrement: globalState.action('decrement', (state) => {
        const count = state.get('counter.count') || 0;
        state.set('counter.count', count - 1);
    }),

    reset: globalState.action('reset', (state) => {
        state.set('counter.count', 0);
    })
};

// Use in components
const GlobalCounter = defineComponent({
    afterMount() {
        this.subscribeToGlobalState('counter.count', () => {
            this.setState('updated', Date.now()); // Trigger re-render
        });
    },

    render() {
        const count = globalState.get('counter.count') || 0;

        return h('div', {}, [
            h('span', {}, `Global Count: ${count}`),
            h('button', { onclick: counterActions.increment }, '+'),
            h('button', { onclick: counterActions.decrement }, '-'),
            h('button', { onclick: counterActions.reset }, 'Reset')
        ]);
    }
});
```

## Routing Examples

### Basic Routing

```javascript
import { router, globalState } from '@bernotieno/mini-framework';

// Set up routes
router.route('/', () => {
    globalState.set('currentPage', 'home');
});

router.route('/users', () => {
    globalState.set('currentPage', 'users');
});

router.route('/users/:id', (route) => {
    globalState.set('currentPage', 'user-detail');
    globalState.set('currentUserId', route.params.id);
});

// Route with query parameters
router.route('/search', (route) => {
    globalState.set('currentPage', 'search');
    globalState.set('searchQuery', route.query.q || '');
});
```

### Route-based Component Rendering

```javascript
const App = defineComponent({
    afterMount() {
        this.subscribeToGlobalState('currentPage', () => {
            this.setState('updated', Date.now());
        });
    },

    render() {
        const currentPage = globalState.get('currentPage');

        return h('div', { class: 'app' }, [
            h('nav', {}, [
                h('a', {
                    href: '#/',
                    onclick: (e) => {
                        e.preventDefault();
                        router.navigate('/');
                    }
                }, 'Home'),
                h('a', {
                    href: '#/users',
                    onclick: (e) => {
                        e.preventDefault();
                        router.navigate('/users');
                    }
                }, 'Users')
            ]),
            h('main', {}, this.renderPage(currentPage))
        ]);
    },

    renderPage(page) {
        switch (page) {
            case 'home':
                return h(HomePage);
            case 'users':
                return h(UsersPage);
            case 'user-detail':
                return h(UserDetailPage, {
                    userId: globalState.get('currentUserId')
                });
            default:
                return h('div', {}, 'Page not found');
        }
    }
});
```

## TodoMVC Example

The `examples/todomvc/` directory contains a complete TodoMVC implementation demonstrating all framework features:

- **State Management**: Global state for todos, filters, and editing state
- **Components**: Modular components for header, todo items, and footer
- **Events**: Custom event handling for user interactions
- **Routing**: URL-based filtering (all/active/completed)
- **Persistence**: Local storage integration

Key features implemented:
- ✅ Add new todos
- ✅ Toggle todo completion
- ✅ Edit todos (double-click)
- ✅ Delete todos
- ✅ Filter todos (All/Active/Completed)
- ✅ Clear completed todos
- ✅ Toggle all todos
- ✅ Persistent storage
- ✅ URL routing

## API Reference

### Core Functions

- `h(tag, attrs, children)` - Create virtual DOM elements
- `createApp(options)` - Create application instance
- `defineComponent(definition)` - Create component class

### State Management

- `globalState.get(path)` - Get state value
- `globalState.set(path, value)` - Set state value
- `globalState.update(path, updater)` - Update with function
- `globalState.subscribe(path, callback)` - Subscribe to changes
- `globalState.action(name, actionFn)` - Create state action

### Routing

- `router.route(path, handler)` - Define route
- `router.navigate(path, options)` - Navigate to route
- `router.beforeEach(hook)` - Add before navigation hook
- `router.afterEach(hook)` - Add after navigation hook

### Events

- `eventEmitter.on(event, callback)` - Subscribe to event
- `eventEmitter.emit(event, data)` - Emit event
- `domEvents.bind(element, event, handler)` - Bind DOM event

## Security Features

Mini Framework includes comprehensive security measures to protect against common web vulnerabilities:

### XSS Protection
- **HTML Escaping**: All text content is automatically escaped to prevent script injection
- **Attribute Sanitization**: Dangerous attributes like `onclick` with string values are blocked
- **URL Validation**: `javascript:` and unsafe `data:` URLs are automatically blocked
- **CSS Sanitization**: Style attributes are cleaned to remove dangerous CSS expressions

### Input Validation
- **Path Traversal Protection**: Router paths are sanitized to prevent `../` attacks
- **Prototype Pollution Prevention**: State objects are validated to block `__proto__` manipulation
- **Event Name Validation**: Event names are sanitized and length-limited
- **Storage Key Validation**: LocalStorage keys are validated and sanitized

### Resource Limits
- **Memory Protection**: Limits on subscribers, routes, and event listeners prevent memory exhaustion
- **Recursion Prevention**: Maximum depth limits prevent stack overflow attacks
- **Rate Limiting**: Event emission is rate-limited to prevent DoS attacks
- **Size Limits**: Storage values are size-checked to prevent quota exhaustion

### Error Handling
- **Graceful Degradation**: Components continue working even when individual parts fail
- **Error Boundaries**: Rendering errors are contained and don't crash the entire app
- **Safe Fallbacks**: Invalid operations fall back to safe defaults
- **Comprehensive Logging**: All security events are logged for monitoring

```javascript
// Example: Automatic XSS protection
const userInput = '<script>alert("xss")</script>';
h('div', {}, userInput); // Automatically escaped: &lt;script&gt;alert("xss")&lt;/script&gt;

// Example: Blocked dangerous attributes
h('div', { onclick: 'alert("xss")' }); // Blocked and logged as warning

// Example: Safe URL handling
h('a', { href: 'javascript:alert("xss")' }); // Blocked and logged as warning
```

## Error Handling Best Practices

The framework provides robust error handling throughout:

### Component Error Boundaries
```javascript
const SafeComponent = defineComponent({
  render() {
    try {
      return h('div', {}, this.renderContent());
    } catch (error) {
      console.error('Component render error:', error);
      return h('div', { class: 'error' }, 'Something went wrong');
    }
  }
});
```

### State Error Recovery
```javascript
// State operations are automatically wrapped in try-catch
globalState.set('user.profile', userData); // Safe even if userData is invalid

// Subscribe with error handling
globalState.subscribe('user', (user) => {
  try {
    updateUI(user);
  } catch (error) {
    console.error('UI update failed:', error);
    // Framework continues working
  }
});
```

### Event Error Isolation
```javascript
// Event handlers are automatically wrapped for safety
h('button', {
  onclick: () => {
    throw new Error('Handler error');
    // Error is caught and logged, app continues working
  }
}, 'Click me');
```

## Browser Support

- Modern browsers with ES6+ support
- Chrome 61+
- Firefox 60+
- Safari 12+
- Edge 79+

## File Structure

```
mini-framework/
├── src/
│   ├── core/
│   │   ├── dom.js          # Virtual DOM implementation
│   │   ├── events.js       # Custom event system
│   │   ├── state.js        # Reactive state management
│   │   └── router.js       # Client-side routing
│   ├── framework.js        # Main framework entry
│   └── utils.js           # Utility functions
├── examples/
│   └── todomvc/           # TodoMVC implementation
├── README.md              # This documentation
└── package.json           # Project configuration
```

## Publishing to NPM

This framework is designed to be published as an npm package. Here's how to publish it:

### Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://npmjs.com)
2. **Login to NPM**: Run `npm login` in your terminal
3. **Update Package Name**: The package is configured as `@bernotieno/mini-framework`

### Publishing Steps

1. **Package Configuration** (already configured):
   ```json
   {
     "name": "@bernotieno/mini-framework",
     "repository": {
       "type": "git",
       "url": "git+https://github.com/bernotieno/mini-framework.git"
     },
     "bugs": {
       "url": "https://github.com/bernotieno/mini-framework/issues"
     },
     "homepage": "https://github.com/bernotieno/mini-framework#readme"
   }
   ```

2. **Version Management**:
   ```bash
   # Patch version (1.0.0 -> 1.0.1)
   npm version patch

   # Minor version (1.0.0 -> 1.1.0)
   npm version minor

   # Major version (1.0.0 -> 2.0.0)
   npm version major
   ```

3. **Publish**:
   ```bash
   # For scoped packages (recommended)
   npm publish --access public

   # For unscoped packages
   npm publish
   ```

### Using the Published Package

Once published, users can install and use your framework:

```bash
npm install @bernotieno/mini-framework
```

```javascript
import { createApp, defineComponent, h } from '@bernotieno/mini-framework';

const MyComponent = defineComponent({
  render() {
    return h('div', {}, 'Hello from Mini Framework!');
  }
});

const app = createApp();
const component = new MyComponent();
component.mount(document.getElementById('app'));
```

### Package Features

- ✅ **ES Modules**: Native ES module support
- ✅ **TypeScript Definitions**: Included for better developer experience
- ✅ **Zero Dependencies**: No external runtime dependencies
- ✅ **Tree Shakeable**: Import only what you need
- ✅ **CDN Ready**: Works with unpkg, jsDelivr, etc.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this framework in your projects!

---

**Mini Framework** - Building modern web apps with zero dependencies! 🚀
