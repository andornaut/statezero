const { action } = require('../dist/statezero.umd');

const getCountTimesTwo = state => (state.count || 0) * 2;

const assignState = action(({ commit, state }, newState) => {
  Object.assign(state, newState);
  commit(state);
});

const count = (obj) => {
  obj.count = (obj.count || 0) + 1;
};

const incrementCount = action(({ commit, state }) => {
  count(state);
  commit(state);
});

const incrementCountAndDeeplyNestedCount = action(({ commit, state }) => {
  state.deeply = state.deeply || {};
  state.deeply.nested = state.deeply.nested || {};
  count(state.deeply.nested);
  count(state);
  commit(state);
});

const incrementNestedCount = action(({ commit, state }) => {
  state.nested = state.nested || {};
  count(state.nested);
  commit(state);
});

const resetState = action(({ commit }) => {
  commit({});
});

module.exports = {
  assignState,
  getCountTimesTwo,
  incrementCount,
  incrementCountAndDeeplyNestedCount,
  incrementNestedCount,
  resetState,
};
