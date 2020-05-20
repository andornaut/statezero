// Keep track of the top-level state object during cloning so that getters can access it later
const ROOT = Symbol('statezero root');

export const getRoot = (obj) => obj[ROOT];

export const setRoot = (obj, root) => {
  obj[ROOT] = root;
};
