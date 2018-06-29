import deepFreeze from 'deep-freeze-strict';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import omit from 'lodash-es/omit';
import isString from 'lodash-es/isString';
import mapValues from 'lodash-es/mapValues';

let state = {};
const subscribers = new Set();
const computedProps = {};

const appendComputedProps = aState => ({
  ...cloneDeep(aState),
  computed: mapValues(computedProps, computeFn => computeFn(aState)),
});

const freezeWithComputedProps = aState => deepFreeze(appendComputedProps(aState));

const applyJSONFilter = (callback, filter) => (next, prev) => {
  const filteredNext = filter(next);
  const filteredPrev = filter(prev);
  if (JSON.stringify(filteredNext) !== JSON.stringify(filteredPrev)) {
    callback(filteredNext, filteredPrev);
  }
};

const createJSONPathFilter = path => _state => get(_state, path);

const notify = (newState, prevState) => {
  for (const subscriber of subscribers) {
    subscriber(freezeWithComputedProps(newState), freezeWithComputedProps(prevState));
  }
};

const commit = (newState) => {
  const prev = omit(state, 'computed');
  state = omit(newState, 'computed');
  notify(state, prev);
};

const action = fn => (...args) => fn({ commit, state: appendComputedProps(state) }, ...args);

const getState = () => freezeWithComputedProps(state);

const registerComputedProp = (key, computeFn) => {
  computedProps[key] = computeFn;
};

const deregisterComputedProp = (key) => {
  delete computedProps[key];
};

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

export {
  action,
  getState,
  registerComputedProp,
  deregisterComputedProp,
  subscribe,
  subscribeOnce,
  unsubscribe,
  clearSubscribers,
};
