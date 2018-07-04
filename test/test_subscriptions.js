const assert = require('assert');
const {
  action, clearSubscribers, defineGetter, getState, subscribe, unsubscribe,
} = require('../dist/statezero.umd');

const increment = action(({ commit, state }) => {
  state.count = (state.count || 0) + 1;
  commit(state);
});

const setCount = action(({ commit, state }, count) => {
  state.count = count;
  commit(state);
});

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

const getterSubcriptionsAreCalled = () => {
  let subscriberWasCalled = false;
  setCount(0);
  defineGetter('countProp', state => state.count);

  subscribe(
    (state) => {
      subscriberWasCalled = true;
      assert.equal(getState().count, state.countProp);
      assert.equal(state.countProp, 1);
    },
    ['countProp'],
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

arrayFilteredSubscriberIsNotified();
getterSubcriptionsAreCalled();
stringFilteredSubscriberIsNotified();
unsubscribedCallbackIsNotCalled();
