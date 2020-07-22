const IMMUTABLE = Symbol('immutable');

export function isImmutable(obj) {
  return !!(obj && obj[IMMUTABLE]);
}

export function markImmutable(obj) {
  Object.defineProperty(obj, IMMUTABLE, {
    enumerable: false,
    value: true,
  });
}
