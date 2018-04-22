const assert = require('assert');
const { action, getState } = require('../dist/statezero.umd');

const counter = action(({ commit, state }) => {
  state.count = (state.count || 0) + 1;
  commit(state);
});

counter();
assert.equal(1, getState().count);
