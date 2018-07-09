const {
  defineGetter, getState, subscribe, unsubscribe, unsubscribeAll,
} = require('../dist/statezero.umd');
const { getCountTimesTwo, incrementCount, resetState } = require('./helpers');

beforeEach(resetState);

afterEach(unsubscribeAll);

test('array-filtered subscriber is notified', (done) => {
  const subscriber = (state) => {
    expect(state.count).toBe(1);
    done();
  };

  subscribe(subscriber, ['count']);
  incrementCount();
});

test('getter-subcribers is called', (done) => {
  defineGetter('countTimesTwo', getCountTimesTwo);

  const subscriber = (state) => {
    expect(state.countTimesTwo).toBe(getState().count * 2);
    expect(state.countTimesTwo).toBe(2);
    done();
  };

  subscribe(subscriber, ['countTimesTwo']);
  incrementCount();
});

test('string-filtered subscriber is notified', (done) => {
  const subscriber = (state) => {
    expect(state).toBe(1);
    done();
  };

  subscribe(subscriber, 'count');
  incrementCount();
});

test('unfiltered subscriber is notified', (done) => {
  const subscriber = (state) => {
    expect(state.count).toBe(1);
    done();
  };

  subscribe(subscriber);
  incrementCount();
});

test('unsubscribed filtered-subscriber is NOT notified', (done) => {
  const subscriber = jest.fn();
  const subscription = subscribe(subscriber, 'count');

  unsubscribe(subscription);
  incrementCount();

  setTimeout(() => {
    expect(subscriber).not.toHaveBeenCalled();
    done();
  }, 1);
});

test('unsubscribed un-filtered is NOT notified', (done) => {
  const subscriber = jest.fn();
  subscribe(subscriber);

  unsubscribe(subscriber);
  incrementCount();

  setTimeout(() => {
    expect(subscriber).not.toHaveBeenCalled();
    done();
  }, 1);
});
