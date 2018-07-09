import deepFreeze from 'deep-freeze-strict';
import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import set from 'lodash-es/set';

import { clone } from './clone.mjs';
import * as subscriptions from './subscriptions.mjs';

let state = deepFreeze({});

const notify = (newState, prevState) => {
  for (const subscriber of subscriptions.subscribers) {
    subscriber(newState, prevState);
  }
};

const commit = (newState) => {
  const prevState = state;
  state = deepFreeze(newState);
  notify(state, prevState);
};

export const action = fn => (...args) => fn({ commit, state: clone(state) }, ...args);

export const getState = () => state;

/**
 * Define a getter (computed property) on the state.
 *
 * @param path: A JSON path as a string eg. "a.b.c", or and array eg. ['a', 'b', 'c'] or property name like "c".
 *  If a parent path component does not exist, then it will be created as an empty object.
 * @param fn: A function which takes state as its only parameter and returns a value.
 */
export const defineGetter = action((context, path, fn) => {
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

  Object.defineProperty(obj, propName, {
    get() {
      return fn.call(this, this);
    },
  });
  context.commit(context.state);
});

export const {
  subscribeOnce, subscribe, unsubscribeAll, unsubscribe,
} = subscriptions;
