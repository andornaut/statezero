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

// Derived from: https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object/728694#728694
const _clone = (value, root) => {
  if (value === undefined || value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Array) {
    const copy = [];
    for (let i = 0, len = value.length; i < len; i += 1) {
      // `root` is only undefined when value is the top-level object (which is by definition not an Array).
      copy[i] = _clone(value[i], root);
    }
    return copy;
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof Object) {
    const copy = {};
    // `root` is undefined when `value` is the top-level state object
    root = root || copy;
    for (const propName of Object.getOwnPropertyNames(value)) {
      // Includes non-enumerable properties
      copy[propName] = _clone(value[propName], root);
    }

    const getters = getterDescriptors(value);
    if (root && Object.keys(getters)) {
      Object.defineProperty(copy, ROOT, {
        writable: true,
        value: root,
      });
    }
    Object.defineProperties(copy, getters);
    return copy;
  }

  throw new Error(`Cannot clone: '${value} of type ${typeof value}`);
};

export const clone = (obj) => {
  if (!isPlainObject(obj)) {
    throw new Error(`clone() must be called with a plain object "obj" argument; not: ${obj}`);
  }
  // Enforce that _clone() is only ever called externally with a plain object and `root=undefined`.
  return _clone(obj);
};
