import { get, isEqualWith } from "lodash-es";

import { isImmutable } from "./immutable";

export const subscribersAsync = new Set();
export const subscribersSync = new Set();

// When customizer returns undefined, comparisons are handled by lodash
// https://lodash.com/docs/4.17.15#isEqualWith
const isEqualCustomizer = (value, othValue) =>
  isImmutable(value) ? value === othValue : undefined;

const applySelector = (callback, selector) => (nextState, prevState) => {
  const selectedNextState = selector(nextState);
  const selectedPrevState = selector(prevState);
  if (!isEqualWith(selectedNextState, selectedPrevState, isEqualCustomizer)) {
    callback(selectedNextState, selectedPrevState, nextState);
  }
};

const applyRootState = (callback) => (nextState, prevState) => {
  callback(nextState, prevState, nextState);
};

const createArraySelector = (paths) => (_state) =>
  paths.map((path) => get(_state, path));

const createStringSelector = (path) => (_state) => get(_state, path);

/**
 * Subscribe to changes of state.
 *
 * @param callback: A function which is called when the state changes.
 * @param selector: One of:
 *  - Dot notation path string, eg: 'a.b'
 *  - Array of dot notation path strings, eg: ['a.b', 'c']
 *  - A function which returns a derived state, eg: (newState, oldState) => { b: newState.a.b, c: newState.c }
 * @param isSync: If true, then notifications will be executed synchronously; otherwise, they will be executed on the
 *  next tick
 */
export const subscribe = (callback, selector, isSync = false) => {
  // Convert an array or string selector into a function.
  let select = selector;
  if (typeof selector === "string") {
    select = createStringSelector(selector);
  } else if (Array.isArray(selector)) {
    select = createArraySelector(selector);
  }

  // Every branch below assigns it or throws.
  let notify;
  if (typeof select === "function") {
    notify = applySelector(callback, select);
  } else if (select === undefined) {
    notify = applyRootState(callback);
  } else {
    const selectorStr =
      typeof selector === "object" ? JSON.stringify(selector) : selector;
    throw new Error(
      `statezero: subscribe() must be called with an Array/Function/String/undefined selector; not ${selectorStr}`,
    );
  }

  if (isSync) {
    subscribersSync.add(notify);
  } else {
    subscribersAsync.add(notify);
  }

  // If a `selector` was provided, then the caller will need to use the returned `callback` in order to `unsubscribe()`.
  return notify;
};

export const subscribeSync = (callback, selector) =>
  subscribe(callback, selector, true);

export const subscribeOnce = (callback, selector, isSync = false) => {
  const wrapper = (...args) => {
    callback(...args);
    unsubscribe(subscription);
  };

  const subscription = subscribe(wrapper, selector, isSync);
  return subscription;
};

export const subscribeOnceSync = (callback, selector) =>
  subscribeOnce(callback, selector, true);

export const unsubscribe = (callback) => {
  subscribersAsync.delete(callback);
  subscribersSync.delete(callback);
};

export const unsubscribeAll = () => {
  subscribersAsync.clear();
  subscribersSync.clear();
};
