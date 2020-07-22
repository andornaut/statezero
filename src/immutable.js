const IMMUTABLE = {}; // Sentinel object.

export function isImmutable(obj) {
  return obj[IMMUTABLE] === true;
}

export function markImmutable(obj) {
  Object.defineProperty(obj, IMMUTABLE, {
    enumerable: false,
    value: true,
  });
}
