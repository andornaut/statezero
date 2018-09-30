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
  if (!isPlainObject(obj)) {
    throw new Error(`clone() must be called with a plain object "obj" argument; not: ${obj}`);
  }

  const cloned = JSON.parse(JSON.stringify(obj));
  cloneGetters(obj, cloned, cloned);
  return cloned;
};
