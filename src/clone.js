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

export const clone = (obj) => {
  const seen = new WeakSet();
  let root;

  const customizer = (value) => {
    if (!isPlainObject(value)) {
      // Default clone operation
      return undefined;
    }
    if (seen.has(value)) {
      throw new TypeError('Cannot clone object graph that contains cycles');
    }
    seen.add(value);

    const cloned = {};

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
