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
export const clone = (value) => {
  if (value === undefined || value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof Array) {
    const copy = [];
    for (let i = 0, len = value.length; i < len; i += 1) {
      copy[i] = clone(value[i]);
    }
    return copy;
  }

  if (value instanceof Object) {
    const copy = {};
    for (const propName of Object.getOwnPropertyNames(value)) {
      // Includes non-enumerable properties
      copy[propName] = clone(value[propName]);
    }

    Object.defineProperties(copy, getterDescriptors(value));
    return copy;
  }

  throw new Error(`Cannot clone: '${value} of type ${typeof value}`);
};
