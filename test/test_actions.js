const { getState } = require('../dist/statezero.umd');
const { incrementCount, resetState } = require('./helpers');

beforeEach(resetState);

test('action mutates state', () => {
  incrementCount();

  expect(getState().count).toBe(1);
});
