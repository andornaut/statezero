const assert = require('assert');
const { action, getState } = require('../dist/statezero.umd');

const increment = action(({ commit, state }) => {
  state.count = (state.count || 0) + 1;
  commit(state);
});

const setCount = action(({ commit, state }, count) => {
  state.count = count;
  commit(state);
});

const actionMutatesState = () => {
  setCount(0);

  increment();

  assert.equal(getState().count, 1);
};

actionMutatesState();
