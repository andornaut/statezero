import deepFreeze from 'deep-freeze-strict';
import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import isString from 'lodash-es/isString';
import pick from 'lodash-es/pick';

import { clone } from './clone.mjs';

let state = {};
const subscribers = new Set();

const applyFilter = (callback, filter) => (next, prev) => {
  next = filter(next);
  prev = filter(prev);
  if (JSON.stringify(next) !== JSON.stringify(prev)) {
    callback(next, prev);
  }
};

const createArrayFilter = paths => _state => pick(_state, paths);

const createStringFilter = path => _state => get(_state, path);

const notify = (newState, prevState) => {
  for (const subscriber of subscribers) {
    subscriber(newState, prevState);
  }
};

const commit = (newState) => {
  const prevState = state;
  state = deepFreeze(newState);
  notify(state, prevState);
};

export const action = fn => (...args) => fn({ commit, state: clone(state) }, ...args);

export const getState = () => state;

/**
 * Define a getter (computed property) on the state.
 *
 * @param path: A JSON path as a string eg. "a.b.c", or and array eg. ['a', 'b', 'c'] or property name like "c".
 *  If a parent path component does not exist, then it will be created as an empty object.
 * @param fn: A function which takes state as its only parameter and returns a value.
 */
export const defineGetter = action((context, path, fn) => {
  const pathArray = isArray(path) ? path : path.split('.');
  const lastIdx = pathArray.length - 1;
  const propName = pathArray[lastIdx];
  const parentPath = pathArray.slice(0, lastIdx);
  const obj = parentPath.length ? get(context.state, parentPath, {}) : context.state;

  Object.defineProperty(obj, propName, {
    get() {
      return fn.call(this, this);
    },
  });
  context.commit(context.state);
});

/**
 * Subscribe to changes of state.
 *
 * @param callback: A function which is called when the state (filtered or not) changes.
 * @param filter: One of:
 *  - JSON path string, eg: 'a'
 *  - Array of JSON path strings, eg: ['a', 'b']
 *  - A function which returns the filtered state, eg: (newState, oldState) => { a: newState.a, b: newState.b }
 */
export const subscribe = (callback, filter) => {
  if (isString(filter)) {
    filter = createStringFilter(filter);
  } else if (isArray(filter)) {
    filter = createArrayFilter(filter);
  }

  if (filter) {
    callback = applyFilter(callback, filter);
  }
  subscribers.add(callback);

  // If a `filter` was provided, then the caller will need to use the returned `callback` in order to `unsubscribe()`.
  return callback;
};

export const subscribeOnce = (callback, filter) => {
  const wrapper = (...args) => {
    callback(...args);
    // eslint-disable-next-line no-use-before-define
    unsubscribe(subscription);
  };

  const subscription = subscribe(wrapper, filter);
  return subscription;
};

export const unsubscribe = (callback) => {
  subscribers.delete(callback);
};

export const clearSubscribers = () => {
  subscribers.clear();
};
