// Keep track of the top-level state object during cloning so that getters can access it later
const ROOT = "__statezero_root";

export function getRoot(obj) {
  return obj ? obj[ROOT] : undefined;
}

export function setRoot(obj, rootState) {
  Object.defineProperty(obj, ROOT, {
    enumerable: false,
    value: rootState,
  });
}
