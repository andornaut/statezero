const SHALLOW = Symbol('statezero shallow');

export const isShallow = obj => !!obj[SHALLOW];

export const markShallow = (obj) => {
  obj[SHALLOW] = true;
};
