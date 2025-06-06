/**
 * TodoMVC Application
 * Built with Mini Framework - follows TodoMVC specification exactly
 */

import { globalState, router, storage } from '../../src/framework.js';

// Constants
const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

// Initialize global state for todos
globalState.set('todos', storage.get('todos-mini-framework', []));
globalState.set('filter', 'all');
globalState.set('editingId', null);

// Save todos to localStorage whenever they change
globalState.subscribe('todos', (todos) => {
    storage.set('todos-mini-framework', todos);
});

// Todo actions
const todoActions = {
    addTodo: (text) => {
        const trimmedText = text.trim();
        if (!trimmedText) return;

        const todos = globalState.get('todos');
        const newTodo = {
            id: Date.now(),
            title: trimmedText,
            completed: false
        };

        globalState.set('todos', [...todos, newTodo]);
    },

    toggleTodo: (id) => {
        const todos = globalState.get('todos');
        const updatedTodos = todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        globalState.set('todos', updatedTodos);
    },

    deleteTodo: (id) => {
        const todos = globalState.get('todos');
        const filteredTodos = todos.filter(todo => todo.id !== id);
        globalState.set('todos', filteredTodos);
    },

    editTodo: (id, newText) => {
        const trimmedText = newText.trim();
        if (!trimmedText) {
            todoActions.deleteTodo(id);
            return;
        }

        const todos = globalState.get('todos');
        const updatedTodos = todos.map(todo =>
            todo.id === id ? { ...todo, title: trimmedText } : todo
        );
        globalState.set('todos', updatedTodos);
        globalState.set('editingId', null);
    },

    toggleAll: () => {
        const todos = globalState.get('todos');
        const allCompleted = todos.every(todo => todo.completed);
        const updatedTodos = todos.map(todo => ({
            ...todo,
            completed: !allCompleted
        }));
        globalState.set('todos', updatedTodos);
    },

    clearCompleted: () => {
        const todos = globalState.get('todos');
        const activeTodos = todos.filter(todo => !todo.completed);
        globalState.set('todos', activeTodos);
    },

    setFilter: (filter) => {
        globalState.set('filter', filter);
    },

    startEditing: (id) => {
        globalState.set('editingId', id);
        // Focus the edit input after DOM update
        setTimeout(() => {
            const editInput = document.querySelector('.editing .edit');
            if (editInput) {
                editInput.focus();
                editInput.select();
            }
        }, 0);
    },

    stopEditing: () => {
        globalState.set('editingId', null);
    }
};

// DOM elements
let newTodoInput;
let todoList;
let main;
let footer;
let todoCount;
let clearCompletedBtn;
let toggleAllCheckbox;
let filterLinks;

// Initialize DOM references and event listeners
function initializeApp() {
    newTodoInput = document.querySelector('.new-todo');
    todoList = document.querySelector('#todo-list');
    main = document.querySelector('#main');
    footer = document.querySelector('#footer');
    todoCount = document.querySelector('.todo-count');
    clearCompletedBtn = document.querySelector('.clear-completed');
    toggleAllCheckbox = document.querySelector('#toggle-all');
    filterLinks = document.querySelectorAll('.filters a');

    // Event listeners
    newTodoInput.addEventListener('keydown', handleNewTodoKeydown);
    toggleAllCheckbox.addEventListener('change', todoActions.toggleAll);
    clearCompletedBtn.addEventListener('click', todoActions.clearCompleted);

    // Filter links
    filterLinks.forEach(link => {
        link.addEventListener('click', handleFilterClick);
    });

    // Subscribe to state changes
    globalState.subscribe('todos', render);
    globalState.subscribe('filter', render);
    globalState.subscribe('editingId', render);

    // Initial render
    render();
}

function handleNewTodoKeydown(e) {
    if (e.keyCode === ENTER_KEY) {
        todoActions.addTodo(e.target.value);
        e.target.value = '';
    }
}

function handleFilterClick(e) {
    e.preventDefault();
    const filter = e.target.getAttribute('href').slice(2) || 'all';
    todoActions.setFilter(filter);
    router.navigate(e.target.getAttribute('href').slice(1));
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    const editingId = globalState.get('editingId');
    const isEditing = editingId === todo.id;

    li.className = `${todo.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}`;
    li.setAttribute('data-id', todo.id);

    li.innerHTML = `
        <div class="view">
            <input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''}>
            <label>${todo.title}</label>
            <button class="destroy"></button>
        </div>
        <input class="edit" value="${todo.title}">
    `;

    // Event listeners for this todo item
    const toggle = li.querySelector('.toggle');
    const label = li.querySelector('label');
    const destroy = li.querySelector('.destroy');
    const edit = li.querySelector('.edit');

    toggle.addEventListener('change', () => todoActions.toggleTodo(todo.id));
    label.addEventListener('dblclick', () => todoActions.startEditing(todo.id));
    destroy.addEventListener('click', () => todoActions.deleteTodo(todo.id));

    edit.addEventListener('keydown', (e) => {
        if (e.keyCode === ENTER_KEY) {
            todoActions.editTodo(todo.id, e.target.value);
        } else if (e.keyCode === ESCAPE_KEY) {
            todoActions.stopEditing();
        }
    });

    edit.addEventListener('blur', (e) => {
        if (editingId === todo.id) {
            todoActions.editTodo(todo.id, e.target.value);
        }
    });

    return li;
}

function render() {
    const todos = globalState.get('todos');
    const filter = globalState.get('filter');

    // Show/hide main and footer based on todos
    if (todos.length === 0) {
        main.style.display = 'none';
        footer.style.display = 'none';
    } else {
        main.style.display = 'block';
        footer.style.display = 'block';
    }

    // Filter todos
    let filteredTodos = todos;
    if (filter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    // Update todo list
    todoList.innerHTML = '';
    filteredTodos.forEach(todo => {
        todoList.appendChild(createTodoElement(todo));
    });

    // Update toggle all checkbox
    const allCompleted = todos.length > 0 && todos.every(todo => todo.completed);
    toggleAllCheckbox.checked = allCompleted;

    // Update counter
    const activeCount = todos.filter(todo => !todo.completed).length;
    todoCount.innerHTML = `<strong>${activeCount}</strong> ${activeCount === 1 ? 'item' : 'items'} left`;

    // Update clear completed button
    const completedCount = todos.filter(todo => todo.completed).length;
    clearCompletedBtn.style.display = completedCount > 0 ? 'block' : 'none';

    // Update filter links
    filterLinks.forEach(link => {
        const linkFilter = link.getAttribute('href').slice(2) || 'all';
        link.className = linkFilter === filter ? 'selected' : '';
    });
}

// Setup routing
router.route('/', () => todoActions.setFilter('all'));
router.route('/active', () => todoActions.setFilter('active'));
router.route('/completed', () => todoActions.setFilter('completed'));

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();

    // Set initial filter based on URL
    const currentPath = window.location.hash.slice(1) || '/';
    if (currentPath === '/active') {
        todoActions.setFilter('active');
    } else if (currentPath === '/completed') {
        todoActions.setFilter('completed');
    } else {
        todoActions.setFilter('all');
    }
});
