import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import set from 'lodash/set';
import simpleDeepFreeze from 'simple-deep-freeze';

import { clone } from './clone';
import { markImmutable } from './immutable';
import { subscribersAsync, subscribersSync } from './subscriptions';

let state = simpleDeepFreeze({});
let prevStateForNotify;

const notifyAsync = (prevState) => {
  // Debounce notifications
  if (prevStateForNotify !== undefined) {
    return;
  }
  prevStateForNotify = prevState;

  setTimeout(() => {
    const prevStateForSubscriber = prevStateForNotify;
    prevStateForNotify = undefined;
    for (const subscriber of subscribersAsync) {
      subscriber(state, prevStateForSubscriber);
    }
  });
};

const notifySync = (prevState) => {
  for (const subscriber of subscribersSync) {
    subscriber(state, prevState);
  }
};

const commit = (nextState) => {
  if (!isPlainObject(nextState)) {
    throw new Error(`statezero: commit() must be called with a plain object "nextState" argument; not: ${nextState}`);
  }
  const prevState = state;
  state = simpleDeepFreeze(nextState);
  notifyAsync(prevState);
  notifySync(prevState);
};

export const action = (fn) => (...args) => fn({ commit, state: clone(state) }, ...args);

export const getState = (selector) => {
  if (selector === undefined) {
    return state;
  }
  if (isString(selector)) {
    return get(state, selector);
  }
  if (isArray(selector)) {
    return selector.map((path) => get(state, path));
  }
  if (isFunction(selector)) {
    return selector(state);
  }
  throw new Error(
    `statezero: getState() must be called with an Array/Function/String/undefined "selector" argument; not ${selector}`,
  );
};

// eslint-disable-next-line no-shadow
export const setState = action(({ commit, state }, selector, value) => {
  if (selector === undefined || selector === null || selector === '') {
    state = value;
  } else if (isString(selector)) {
    set(state, selector, value);
  } else {
    throw new Error(
      `statezero: setState() must be called with an String/undefined "selector" argument; not ${selector}`,
    );
  }
  commit(state);
});

export const setImmutableState = (selector, obj) => {
  if (!selector) {
    throw new Error('statezero: setImmutableState() must be called with a non-empty String "selector" argument');
  }
  if (!isPlainObject(obj)) {
    throw new Error(`statezero: setImmutableState() must be called with a plain object "obj" argument; not: ${obj}`);
  }
  markImmutable(obj);
  setState(selector, obj);
};
