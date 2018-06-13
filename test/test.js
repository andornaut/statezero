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

const jsonPathSubscriberIsNotified = () => {
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

actionMutatesState();
jsonPathSubscriberIsNotified();
unsubscribedCallbackIsNotCalled();
