import get from 'lodash/get';
import isArray from 'lodash/isArray';
import set from 'lodash/set';

import { ROOT } from './root';
import { action } from './state';

/**
 * Define a getter (computed property) on the state.
 *
 * @param path: A dot notation path as a string eg. "a.b.c", or and array eg. ['a', 'b', 'c'] or property name like "c".
 *  If a parent path component does not exist, then it will be created as an empty object.
 * @param fn: A function which takes state as its only parameter and returns a value.
 * @param enumerable: A boolean which determine whether this property shows up during enumeration.
 */
export const defineGetter = action(({ commit, state }, path, fn, enumerable = false) => {
  const pathArray = isArray(path) ? path : path.split('.');
  const lastIdx = pathArray.length - 1;
  const propName = pathArray[lastIdx];
  const parentPath = pathArray.slice(0, lastIdx);

  let obj = state;
  if (parentPath.length) {
    obj = get(state, parentPath, {});
    // Set parentPath in case it didn't exist (the default case of get() above).
    set(state, parentPath, obj);
  }

  Object.defineProperty(obj, propName, {
    get() {
      return fn.call(this, this, this[ROOT]);
    },
    enumerable,
  });
  obj[ROOT] = state;
  commit(state);
});
