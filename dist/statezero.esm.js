import deepFreeze from 'deep-freeze-strict';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import isString from 'lodash-es/isString';
import mapValues from 'lodash-es/mapValues';

let state = {};
const subscribers = new Set();
const computedProps = {};

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

const freezeAndCompute = (aState) => {
  const computed = mapValues(computedProps, computeFn => computeFn(aState));
  return deepFreeze({ ...aState, computed });
};

const commit = (newState) => {
  const prev = state;
  state = newState;
  notify(freezeAndCompute(state), freezeAndCompute(prev));
};

const copyState = () => cloneDeep(state);

const action = fn => (...args) => fn({ commit, state: copyState() }, ...args);

const getState = () => freezeAndCompute(state);

const subscribe = (callback, filter) => {
  if (isString(filter)) {
    filter = createJSONPathFilter(filter);
  }
  if (filter) {
    callback = applyJSONFilter(callback, filter);
  }
  subscribers.add(callback);

  // If a `filterJSON` was provided, then the caller will need a reference to the augmented `callback` in order to
  // `unsubscribe()`.
  return callback;
};

const registerComputedProp = (key, computeFn) => {
  computedProps[key] = computeFn;
};

const deregisterComputedProp = (key) => {
  delete computedProps[key];
};

const subscribeOnce = (callback, filter) => {
  const wrapper = (...args) => {
    callback(...args);
    // eslint-disable-next-line no-use-before-define
    unsubscribe(subscription);
  };
  const subscription = subscribe(wrapper, filter);
  return subscription;
};

const unsubscribe = (callback) => {
  subscribers.delete(callback);
};

const clearSubscribers = () => {
  subscribers.clear();
};

export { action, getState, subscribe, registerComputedProp, deregisterComputedProp, subscribeOnce, unsubscribe, clearSubscribers };
