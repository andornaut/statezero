const assert = require('assert');
const {
  action, clearSubscribers, getState, subscribe, unsubscribe,
} = require('../dist/statezero.umd');

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

const arrayFilteredSubscriberIsNotified = () => {
  let subscriberWasCalled = false;
  setCount(0);
  subscribe(
    (state) => {
      subscriberWasCalled = true;
      assert.equal(state.count, 1);
    },
    ['count'],
  );

  increment();
  clearSubscribers();

  setTimeout(() => {
    assert.ok(subscriberWasCalled);
  });
};

const stringFilteredSubscriberIsNotified = () => {
  let subscriberWasCalled = false;
  setCount(0);
  subscribe((state) => {
    subscriberWasCalled = true;
    assert.equal(state, 1);
  }, 'count');

  increment();
  clearSubscribers();

  setTimeout(() => {
    assert.ok(subscriberWasCalled);
  });
};

const unsubscribedCallbackIsNotCalled = () => {
  const callback = subscribe(() => {
    assert.fail('subscriber was called');
  }, 'count');

  unsubscribe(callback);
  increment();
};

const setCountProp = action(({ commit, state }) => {
  Object.defineProperty(state, 'countProp', {
    get() {
      return this.count;
    },
  });
  commit(state);
});

const gettersArePreserved = () => {
  setCount(0);

  setCountProp();
  increment();

  const { count, countProp } = getState();
  assert.equal(count, countProp);
  assert.equal(countProp, 1);
};

actionMutatesState();
arrayFilteredSubscriberIsNotified();
gettersArePreserved();
stringFilteredSubscriberIsNotified();
unsubscribedCallbackIsNotCalled();
