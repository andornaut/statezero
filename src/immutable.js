const IMMUTABLE = {};

export function isImmutable(obj) {
  return !!(obj && obj[IMMUTABLE]);
}

export function markImmutable(obj) {
  obj[IMMUTABLE] = true;
}
