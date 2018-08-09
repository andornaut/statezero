const { getState, subscribe } = require('../dist/statezero.umd');
const { incrementCount, resetState } = require('./helpers');

beforeEach((done) => {
  subscribe(() => {
    done();
  });
  resetState();
});

test('action mutates state', () => {
  incrementCount();

  expect(getState().count).toBe(1);
});
