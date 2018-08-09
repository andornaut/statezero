const { getState, subscribe } = require('../dist/statezero.umd');
const { incrementNestedCount, resetState } = require('./helpers');

beforeEach((done) => {
  subscribe(() => {
    done();
  });
  resetState();
});

test('state is immutable', () => {
  getState().count = 5;

  expect(getState().count).toBeUndefined();
});

test('nested state is immutable', () => {
  incrementNestedCount();

  getState().nested.count = 5;

  expect(getState().nested.count).toBe(1);
});
