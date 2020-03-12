export const isImmutable = (obj) => !!(obj && obj.__STATEZERO_IMMUTABLE);

export const markImmutable = (obj) => {
  Object.defineProperty(obj, '__STATEZERO_IMMUTABLE', {
    enumerable: false,
    value: true,
  });
};
