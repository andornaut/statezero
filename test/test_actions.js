const { action, getState, subscribe } = require('../dist/statezero.umd');
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

function Foo() {}

test.each([new Foo(), null, undefined, 0, 1, []])(
  'commit called with invalid "nextState" argument throws error',
  (nextState) => {
    action(({ commit }) => {
      expect(() => {
        commit(nextState);
      }).toThrow();
    })();
  },
);
