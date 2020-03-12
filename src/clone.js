import cloneDeepWith from 'lodash-es/cloneDeepWith';
import isPlainObject from 'lodash-es/isPlainObject';

import { isImmutable } from './immutable';

const getterDescriptors = (obj) => {
  const descriptorEntries = Object.entries(Object.getOwnPropertyDescriptors(obj));

  return descriptorEntries.reduce((accumulator, [name, descriptor]) => {
    if (descriptor.get) {
      accumulator[name] = descriptor;
    }
    return accumulator;
  }, {});
};

/* Deep clone the given object.
 *
 * An empty object is returned for uncloneable values such as error objects, DOM nodes, and WeakMaps; with the
 * exception of functions, which are returned as is.
 *
 * @param obj: An object such that `isPlainObject(obj)` evaluates to `true`
 */
export const clone = (obj) => {
  const seen = new WeakMap();
  let root;

  const customizer = (value) => {
    if (!isPlainObject(value)) {
      // When customizer returns undefined, comparisons are handled by lodash
      // https://lodash.com/docs/4.17.10#clone
      return undefined;
    }

    if (isImmutable(value)) {
      return value;
    }

    let cloned = seen.get(value);
    if (cloned) {
      return cloned;
    }

    cloned = {};
    seen.set(value, cloned);

    if (!root) {
      root = cloned;
    }

    for (const propName of Object.getOwnPropertyNames(value)) {
      const originalVal = value[propName];
      cloned[propName] = typeof originalVal === 'object' ? cloneDeepWith(originalVal, customizer) : originalVal;
    }

    const descriptors = getterDescriptors(value);
    if (Object.keys(descriptors)) {
      // Only objects with getters need a ROOT prop.
      descriptors.__STATEZERO_ROOT = { value: root };
      Object.defineProperties(cloned, descriptors);
    }
    return cloned;
  };

  return cloneDeepWith(obj, customizer);
};
