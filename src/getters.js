import get from 'lodash/get';
import isArray from 'lodash/isArray';
import set from 'lodash/set';

import { ROOT } from './clone';
import { action } from './state';

/**
 * Define a getter (computed property) on the state.
 *
 * @param path: A dot notation path as a string eg. "a.b.c", or and array eg. ['a', 'b', 'c'] or property name like "c".
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
      return fn.call(this, this, this[ROOT]);
    },
    enumerable,
  };

  const descriptors = {
    [propName]: descriptor,
  };
  if (!obj[ROOT]) {
    // This is the first time that a getter has been defined on `obj`, so set its ROOT prop.
    descriptors[ROOT] = { value: context.state };
  }
  Object.defineProperties(obj, descriptors);
  context.commit(context.state);
});
