const IMMUTABLE = Symbol('statezero immutable');

export const isImmutable = (obj) => !!(obj && obj[IMMUTABLE]);

export const markImmutable = (obj) => {
  obj[IMMUTABLE] = true;
};
