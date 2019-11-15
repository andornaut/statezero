import deepFreeze from 'deep-freeze-strict';
import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import isFunction from 'lodash-es/isFunction';
import isPlainObject from 'lodash-es/isPlainObject';
import isString from 'lodash-es/isString';
import set from 'lodash-es/set';

import { clone } from './clone';
import { markImmutable } from './immutable';
import { subscribersAsync, subscribersSync } from './subscriptions';

let state = deepFreeze({});
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
  state = deepFreeze(nextState);
  notifyAsync(prevState);
  notifySync(prevState);
};

export const action = (fn) => (...args) => fn({ commit, state: clone(state) }, ...args);

export const getState = (filter) => {
  if (filter === undefined) {
    return state;
  }
  if (isString(filter)) {
    return get(state, filter);
  }
  if (isArray(filter)) {
    return filter.map((path) => get(state, path));
  }
  if (isFunction(filter)) {
    return filter(state);
  }
  throw new Error(
    `statezero: getState() must be called with an Array/Function/String/undefined "filter" argument; not ${filter}`,
  );
};

// eslint-disable-next-line no-shadow
export const setState = action(({ commit, state }, filter, value) => {
  if (filter === undefined || filter === null || filter === '') {
    state = value;
  } else if (isString(filter)) {
    set(state, filter, value);
  } else {
    throw new Error(`statezero: setState() must be called with an String/undefined "filter" argument; not ${filter}`);
  }
  commit(state);
});

export const setImmutableState = (filter, obj) => {
  if (!filter) {
    throw new Error('statezero: setImmutableState() must be called with a non-empty String "filter" argument');
  }
  if (!isPlainObject(obj)) {
    throw new Error(`statezero: setImmutableState() must be called with a plain object "obj" argument; not: ${obj}`);
  }
  markImmutable(obj);
  setState(filter, obj);
};
