const IMMUTABLE = {}; // Sentinel object.

export function isImmutable(obj) {
  return !!(obj && obj[IMMUTABLE]);
}

export function markImmutable(obj) {
  Object.defineProperty(obj, IMMUTABLE, {
    enumerable: false,
    value: true,
  });
}
