const IMMUTABLE = '__statezero_immutable';

export function isImmutable(obj) {
  return obj && obj[IMMUTABLE] === true;
}

export function markImmutable(obj) {
  Object.defineProperty(obj, IMMUTABLE, {
    enumerable: false,
    value: true,
  });
}
