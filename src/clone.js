import cloneDeepWith from 'lodash-es/cloneDeepWith';
import isPlainObject from 'lodash-es/isPlainObject';

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

/* Clone the given object.
 *
 * Cycles are supported for objects, but not for collections.
 *
 * // Supported
 * const obj = {};
 * obj.child = obj;
 *
 * // Not supported
 * const arr = [];
 * arr.push(arr);
 * const obj = { arr };
 *
 * @param obj: An object such that `isPlainObject(obj)===true`
 */
export const clone = (obj) => {
  const seen = new WeakMap();
  let root;

  const customizer = (value) => {
    if (!isPlainObject(value)) {
      // Default clone operation
      return undefined;
    }

    let cloned = seen.get(value);
    if (cloned !== undefined) {
      return cloned;
    }

    cloned = {};
    seen.set(value, cloned);

    if (!root) {
      root = cloned;
    }

    for (const propName of Object.getOwnPropertyNames(value)) {
      cloned[propName] = cloneDeepWith(value[propName], customizer);
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
