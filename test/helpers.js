const { action } = require('../dist/statezero.umd');

const getCountTimesTwo = state => state.count * 2;

const incrementCount = action(({ commit, state }) => {
  state.count = state.count || 0;
  state.count += 1;
  commit(state);
});

const incrementNestedCount = action(({ commit, state }) => {
  state.nested = state.nested || {};
  state.nested.count = state.nested.count || 0;
  state.nested.count += 1;
  commit(state);
});

const resetState = action(({ commit }) => {
  commit({});
});

module.exports = {
  getCountTimesTwo,
  incrementCount,
  incrementNestedCount,
  resetState,
};
