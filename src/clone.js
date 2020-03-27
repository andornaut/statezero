import cloneDeepWith from 'lodash/cloneDeepWith';
import isElement from 'lodash/isElement';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';

import { isImmutable } from './immutable';

// Keep track of the top-level state object during cloning so that getters can access it later
export const ROOT = Symbol('statezero root state');

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
 * An empty object is returned for uncloneable values such as error objects, and WeakMaps; with the
 * exception of Functions and DOM Elements, which are returned as is.
 *
 * See lodash.clone() documentation for more (the description above applies where the two conflict):
 * https://lodash.com/docs/4.17.15#clone
 */
export const clone = (obj) => {
  const seen = new WeakMap();
  let root;

  const customizer = (value) => {
    if (isElement(value) || isFunction(value)) {
      // Do not attempt to clone DOM nodes or Function, but don't replace them with {} either - leave them as is.
      return value;
    }
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
      descriptors[ROOT] = { value: root };
      Object.defineProperties(cloned, descriptors);
    }
    return cloned;
  };

  return cloneDeepWith(obj, customizer);
};
