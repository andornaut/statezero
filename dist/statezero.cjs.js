'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var deepFreeze = _interopDefault(require('deep-freeze-strict'));
var cloneDeep = _interopDefault(require('lodash-es/cloneDeep'));
var get = _interopDefault(require('lodash-es/get'));
var isString = _interopDefault(require('lodash-es/isString'));
var mapValues = _interopDefault(require('lodash-es/mapValues'));

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

exports.action = action;
exports.getState = getState;
exports.subscribe = subscribe;
exports.registerComputedProp = registerComputedProp;
exports.deregisterComputedProp = deregisterComputedProp;
exports.subscribeOnce = subscribeOnce;
exports.unsubscribe = unsubscribe;
exports.clearSubscribers = clearSubscribers;
