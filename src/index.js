import deepFreeze from 'deep-freeze-strict';

let state = {};
const subscribers = new Set();

const applyFilter = (callback, filter) => (prev, next) => {
  prev = filter(prev);
  next = filter(next);
  if (JSON.stringify(prev) !== JSON.stringify(next)) {
    callback(next);
  }
};

const notify = (previousState, newState) => {
  for (const subscriber of subscribers) {
    subscriber(previousState, newState);
  }
};

const commit = (newState) => {
  const previousState = state;
  state = deepFreeze(newState);
  notify(previousState, state);
};

const copyState = () => JSON.parse(JSON.stringify(state));

export const action = fn => (...args) => fn({ commit, state: copyState() }, ...args);

export const getState = () => state;

export const subscribe = (callback, filter) => {
  if (filter) {
    callback = applyFilter(callback, filter);
  }
  subscribers.add(callback);
};

export const unsubscribe = (callback) => {
  subscribers.delete(callback);
};

export const clearSubscribers = () => {
  subscribers.clear();
};
