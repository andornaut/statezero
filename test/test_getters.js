const assert = require('assert');
const { action, defineGetter, getState } = require('../dist/statezero.umd');

const gettersArePreserved = () => {
  action(({ commit, state }) => {
    state.count = 1;
    commit(state);
  })();

  defineGetter('countProp', state => state.count);
  const { count, countProp } = getState();
  assert.equal(count, countProp);
  assert.equal(countProp, 1);
};

const nestedGettersArePreserved = () => {
  action(({ commit, state }) => {
    state.nested = state.nested || {};
    state.nested.count = 1;
    commit(state);
  })();

  defineGetter('nested.countProp', nested => nested.count);

  assert.equal(getState().nested.countProp, 1);

  action(({ commit, state }) => {
    state.nested.count = 2;
    commit(state);
  })();

  const { count, countProp } = getState().nested;
  assert.equal(count, countProp);
  assert.equal(countProp, 2);
};

gettersArePreserved();
nestedGettersArePreserved();
