Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex.default : ex;
}

const deepFreeze = _interopDefault(require('deep-freeze-strict'));
const cloneDeep = _interopDefault(require('lodash-es/cloneDeep'));
const get = _interopDefault(require('lodash-es/get'));
const omit = _interopDefault(require('lodash-es/omit'));
const isString = _interopDefault(require('lodash-es/isString'));
const mapValues = _interopDefault(require('lodash-es/mapValues'));

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

exports.action = action;
exports.getState = getState;
exports.registerComputedProp = registerComputedProp;
exports.deregisterComputedProp = deregisterComputedProp;
exports.subscribe = subscribe;
exports.subscribeOnce = subscribeOnce;
exports.unsubscribe = unsubscribe;
exports.clearSubscribers = clearSubscribers;
