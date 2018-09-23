import deepFreeze from 'deep-freeze-strict';
import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import isPlainObject from 'lodash-es/isPlainObject';
import set from 'lodash-es/set';

import { clone } from './clone';
import * as subscriptions from './subscriptions';

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
    for (const subscriber of subscriptions.subscribersAsync) {
      subscriber(state, prevStateForSubscriber);
    }
  });
};

const notifySync = (prevState) => {
  for (const subscriber of subscriptions.subscribersSync) {
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

/**
 * Define a getter (computed property) on the state.
 *
 * @param path: A JSON path as a string eg. "a.b.c", or and array eg. ['a', 'b', 'c'] or property name like "c".
 *  If a parent path component does not exist, then it will be created as an empty object.
 * @param fn: A function which takes state as its only parameter and returns a value.
 * @param enumerable: A boolean which determine whether this property shows up during enumeration.
 */
export const defineGetter = action((context, path, fn, enumerable = false) => {
  const pathArray = isArray(path) ? path : path.split('.');
  const lastIdx = pathArray.length - 1;
  const propName = pathArray[lastIdx];
  const parentPath = pathArray.slice(0, lastIdx);

  let obj = context.state;
  if (parentPath.length) {
    obj = get(context.state, parentPath, {});
    // If parentPath didn't exist (the default case of set() above), then set it.
    set(context.state, parentPath, obj);
  }

  const descriptor = {
    get() {
      return fn.call(this, this, state);
    },
    enumerable,
  };
  Object.defineProperty(obj, propName, descriptor);
  context.commit(context.state);
});

export const getState = () => state;

export const {
  subscribeOnce,
  subscribeOnceSync,
  subscribe,
  subscribeSync,
  unsubscribeAll,
  unsubscribe,
} = subscriptions;
