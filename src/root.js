// Keep track of the top-level state object during cloning so that getters can access it later
const ROOT = {}; // Sentinel object.

export function getRoot(obj) {
  return obj[ROOT];
}

export function setRoot(obj, rootState) {
  Object.defineProperty(obj, ROOT, {
    enumerable: false,
    value: rootState,
  });
}
