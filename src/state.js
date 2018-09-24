import deepFreeze from 'deep-freeze-strict';
import isPlainObject from 'lodash-es/isPlainObject';

import { clone } from './clone';
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
    throw new Error(`commit() must be called with a plain object "nextState" argument; not: ${nextState}`);
  }
  const prevState = state;
  state = deepFreeze(nextState);
  notifyAsync(prevState);
  notifySync(prevState);
};

export const action = fn => (...args) => fn({ commit, state: clone(state) }, ...args);

export const getState = () => state;
