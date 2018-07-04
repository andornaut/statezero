const getterDescriptors = obj =>
  Object.entries(Object.getOwnPropertyDescriptors(obj)).reduce((accumulator, [name, descriptor]) => {
    if (descriptor.get) {
      accumulator[name] = descriptor;
    }
    return accumulator;
  }, {});


// Derived from: https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object/728694#728694
export const clone = (value) => {
  if (value === undefined || value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    const copy = new Date();
    copy.setTime(value.getTime());
    return copy;
  }

  if (value instanceof Array) {
    const copy = [];
    for (let i = 0, len = value.length; i < len; i += 1) {
      copy[i] = clone(value[i]);
    }
    return copy;
  }

  if (value instanceof Object) {
    const getters = getterDescriptors(value);
    const copy = {};
    for (const propName of Object.getOwnPropertyNames(value)) {
      if (Object.prototype.hasOwnProperty.call(value, propName)) {
        copy[propName] = clone(value[propName]);
      }
    }
    Object.defineProperties(copy, getters);
    return copy;
  }

  throw new Error(`Cannot clone: '${value} of type ${typeof value}`);
};
