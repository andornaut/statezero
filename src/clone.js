import cloneDeep from 'lodash-es/cloneDeep';
import isPlainObject from 'lodash-es/isPlainObject';

// Keep track of the top-level state object during cloning in order to give getters access to it
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

const cloneGetters = (original, cloned, root) => {
  const getters = getterDescriptors(original);
  if (Object.keys(getters)) {
    Object.defineProperty(cloned, ROOT, {
      writable: true,
      value: root,
    });
  }
  Object.defineProperties(cloned, getters);

  // Includes non-enumerable properties
  for (const propName of Object.getOwnPropertyNames(original)) {
    const originalProp = original[propName];
    if (isPlainObject(originalProp)) {
      cloneGetters(originalProp, cloned[propName], root);
    }
  }
};

export const clone = (obj) => {
  // Will throw a TypeError if there are cycles.
  const cloned = cloneDeep(obj);
  cloneGetters(obj, cloned, cloned);
  return cloned;
};
