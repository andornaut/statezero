const assert = require('assert');
const {
  unsubscribeAll, defineGetter, getState, subscribe, unsubscribe,
} = require('../dist/statezero.umd');
const { incrementCount, resetState } = require('./helpers');

beforeEach(resetState);

afterEach(unsubscribeAll);

test('array-filtered subscriber is notified', (done) => {
  const subscriber = (state) => {
    assert.equal(state.count, 1);
    done();
  };

  subscribe(subscriber, ['count']);
  incrementCount();
});

test('getter-subcribers is called', (done) => {
  defineGetter('countProp', state => state.count);

  const subscriber = (state) => {
    assert.equal(getState().count, state.countProp);
    assert.equal(state.countProp, 1);
    done();
  };

  subscribe(subscriber, ['countProp']);
  incrementCount();
});

test('string-filtered subscriber is notified', (done) => {
  const subscriber = (state) => {
    assert.equal(state, 1);
    done();
  };

  subscribe(subscriber, 'count');
  incrementCount();
});

test('unfiltered subscriber is notified', (done) => {
  const subscriber = (state) => {
    assert.equal(state.count, 1);
    done();
  };

  subscribe(subscriber);
  incrementCount();
});

test('unsubscribed subscriber is NOT notified', () => {
  const subscriber = subscribe(() => {
    assert.fail('subscriber was notified');
  }, 'count');

  unsubscribe(subscriber);
  incrementCount();
});
