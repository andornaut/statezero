import deepFreeze from 'deep-freeze-strict';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import isString from 'lodash-es/isString';

let state = {};
const subscribers = new Set();

const applyJSONFilter = (callback, filter) => (next, prev) => {
  next = filter(next);
  prev = filter(prev);
  if (JSON.stringify(next) !== JSON.stringify(prev)) {
    callback(next, prev);
  }
};

const createJSONPathFilter = path => _state => get(_state, path);

const notify = (newState, prevState) => {
  for (const subscriber of subscribers) {
    subscriber(newState, prevState);
  }
};

const commit = (newState) => {
  const prev = state;
  state = deepFreeze(newState);
  notify(state, prev);
};

const copyState = () => cloneDeep(state);

export const action = fn => (...args) => fn({ commit, state: copyState() }, ...args);

export const getState = () => state;

export const subscribe = (callback, filterJSON) => {
  if (isString(filterJSON)) {
    filterJSON = createJSONPathFilter(filterJSON);
  }
  if (filterJSON) {
    callback = applyJSONFilter(callback, filterJSON);
  }
  subscribers.add(callback);

  // If a `filterJSON` was provided, then the caller will need a reference to the augmented `callback` in order to
  // `unsubscribe()`.
  return callback;
};

export const unsubscribe = (callback) => {
  subscribers.delete(callback);
};

export const clearSubscribers = () => {
  subscribers.clear();
};
