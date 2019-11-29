import { action, subscribeOnce } from '../src';
import { unsubscribeAll } from '../src/subscriptions';

export const getCountTimesTwo = (state) => (state.count || 0) * 2;

export const assignState = action(({ commit, state }, newState) => {
  Object.assign(state, newState);
  commit(state);
});

const count = (obj) => {
  obj.count = (obj.count || 0) + 1;
};

export const incrementCount = action(({ commit, state }) => {
  count(state);
  commit(state);
});

export const incrementCountAndDeeplyNestedCount = action(({ commit, state }) => {
  state.deeply = state.deeply || {};
  state.deeply.nested = state.deeply.nested || {};
  count(state.deeply.nested);
  count(state);
  commit(state);
});

export const incrementNestedCount = action(({ commit, state }) => {
  state.nested = state.nested || {};
  count(state.nested);
  commit(state);
});

const resolveOnNotify = (selector) =>
  new Promise((resolve) => {
    subscribeOnce((val) => {
      setTimeout(() => resolve(val));
    }, selector);
  });

export const clearStateThenResolve = () => {
  unsubscribeAll();
  action(({ commit }) => {
    commit({});
  })();
  return resolveOnNotify();
};
