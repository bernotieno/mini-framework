/**
 * Mini Framework - Main Entry Point
 * Provides a unified API for all framework features
 */

// Core modules
import { VirtualDOM, vdom, h } from './core/dom.js';
import { EventEmitter, DOMEventManager, eventEmitter, domEvents } from './core/events.js';
import { ReactiveState, globalState, useState, getState, setState, updateState, subscribeToState } from './core/state.js';
import { Router, router } from './core/router.js';

// Framework modules
import { Component, defineComponent } from './framework/component.js';
import { Application, createApp } from './framework/application.js';

// Utilities
import { debounce, throttle, generateId, isEmpty, validators, EventBus, storage } from './utils.js';

// Export everything
export {
  // Core classes
  VirtualDOM,
  EventEmitter,
  DOMEventManager,
  ReactiveState,
  Router,
  Component,
  Application,

  // Default instances
  vdom,
  eventEmitter,
  domEvents,
  globalState,
  router,

  // Factory functions
  createApp,
  defineComponent,

  // Helper functions
  h,
  useState,
  getState,
  setState,
  updateState,
  subscribeToState,

  // Utilities
  debounce,
  throttle,
  generateId,
  isEmpty,
  validators,
  EventBus,
  storage
};


