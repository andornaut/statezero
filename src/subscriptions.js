import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import isEqual from 'lodash-es/isEqual';
import isFunction from 'lodash-es/isFunction';
import isString from 'lodash-es/isString';

export const subscribersAsync = new Set();
export const subscribersSync = new Set();

const applyFilter = (callback, filter) => (nextState, prevState) => {
  nextState = filter(nextState);
  prevState = filter(prevState);
  if (!isEqual(nextState, prevState)) {
    callback(nextState, prevState);
  }
};

const createArrayFilter = paths => _state => paths.map(path => get(_state, path));

const createStringFilter = path => _state => get(_state, path);

/**
 * Subscribe to changes of state.
 *
 * @param callback: A function which is called when the state (filtered or not) changes.
 * @param filter: One of:
 *  - JSON path string, eg: 'a'
 *  - Array of JSON path strings, eg: ['a', 'b']
 *  - A function which returns the filtered state, eg: (newState, oldState) => { a: newState.a, b: newState.b }
 * @param isSync: If true, then notifications will be executed synchronously; otherwise, they will be executed on the
 *  next tick
 */
export const subscribe = (callback, filter, isSync = false) => {
  // Convert an array or string filter into a function.
  if (isString(filter)) {
    filter = createStringFilter(filter);
  } else if (isArray(filter)) {
    filter = createArrayFilter(filter);
  }

  if (isFunction(filter)) {
    callback = applyFilter(callback, filter);
  } else if (filter !== undefined) {
    throw new Error(
      `statezero: subscribe() must be called with an Array/Function/String/undefined "filter" argument; not ${filter}`,
    );
  }

  if (isSync) {
    subscribersSync.add(callback);
  } else {
    subscribersAsync.add(callback);
  }

  // If a `filter` was provided, then the caller will need to use the returned `callback` in order to `unsubscribe()`.
  return callback;
};

export const subscribeSync = (callback, filter) => subscribe(callback, filter, true);

export const subscribeOnce = (callback, filter, isSync = false) => {
  const wrapper = (...args) => {
    callback(...args);
    // eslint-disable-next-line no-use-before-define
    unsubscribe(subscription);
  };

  const subscription = subscribe(wrapper, filter, isSync);
  return subscription;
};

export const subscribeOnceSync = (callback, filter) => subscribeOnce(callback, filter, true);

export const unsubscribe = (callback) => {
  subscribersAsync.delete(callback);
  subscribersSync.delete(callback);
};

export const unsubscribeAll = () => {
  subscribersAsync.clear();
  subscribersSync.clear();
};
