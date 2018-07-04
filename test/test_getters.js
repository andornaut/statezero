const assert = require('assert');
const { action, getState } = require('../dist/statezero.umd');

const gettersArePreserved = () => {
  action(({ commit, state }) => {
    state.count = 1;
    Object.defineProperty(state, 'countProp', {
      get() {
        return this.count;
      },
    });
    commit(state);
  })();

  const { count, countProp } = getState();
  assert.equal(count, countProp);
  assert.equal(countProp, 1);
};

const nestedGettersArePreserved = () => {
  action(({ commit, state }) => {
    state.nested = state.nested || {};
    state.nested.count = 1;
    Object.defineProperty(state.nested, 'countProp', {
      get() {
        return this.count;
      },
    });
    commit(state);
  })();

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
