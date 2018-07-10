const {
  defineGetter, getState, subscribe, unsubscribe, unsubscribeAll,
} = require('../dist/statezero.umd');
const {
  getCountTimesTwo, incrementCount, incrementCountAndDeeplyNestedCount, resetState,
} = require('./helpers');

beforeEach(resetState);

afterEach(unsubscribeAll);

test('array-filtered subscriber is notified', (done) => {
  const subscriber = ([count]) => {
    expect(count).toBe(1);
    done();
  };

  subscribe(subscriber, ['count']);
  incrementCount();
});

test('array-filtered subscriber is notified with multiple properties', (done) => {
  defineGetter('countTimesTwo', getCountTimesTwo);

  const subscriber = ([count, countTimesTwo]) => {
    expect(count).toBe(1);
    expect(countTimesTwo).toBe(2);
    done();
  };

  subscribe(subscriber, ['count', 'countTimesTwo']);
  incrementCount();
});

test('array-filtered subscriber is notified with deeply nested properties', (done) => {
  defineGetter('countTimesTwo', getCountTimesTwo);
  defineGetter('deeply.nested.countTimesTwo', getCountTimesTwo);

  const subscriber = ([count, countTimesTwo, nestedCount, nestedCountTimesTwo]) => {
    expect(count).toBe(2);
    expect(countTimesTwo).toBe(4);
    expect(nestedCount).toBe(1);
    expect(nestedCountTimesTwo).toBe(2);
    done();
  };

  incrementCount();
  subscribe(subscriber, ['count', 'countTimesTwo', 'deeply.nested.count', 'deeply.nested.countTimesTwo']);
  incrementCountAndDeeplyNestedCount();
});

test('array-filtered subscriber is notified with deeply nested properties in inverted order', (done) => {
  defineGetter('countTimesTwo', getCountTimesTwo);
  defineGetter('deeply.nested.countTimesTwo', getCountTimesTwo);

  const subscriber = ([nestedCountTimesTwo, nestedCount, countTimesTwo, count]) => {
    expect(count).toBe(2);
    expect(countTimesTwo).toBe(4);
    expect(nestedCount).toBe(1);
    expect(nestedCountTimesTwo).toBe(2);
    done();
  };

  incrementCount();
  subscribe(subscriber, ['deeply.nested.countTimesTwo', 'deeply.nested.count', 'countTimesTwo', 'count']);
  incrementCountAndDeeplyNestedCount();
});

test('getter-subscriber is called', (done) => {
  defineGetter('countTimesTwo', getCountTimesTwo);

  const subscriber = (countTimesTwo) => {
    expect(countTimesTwo).toBe(getState().count * 2);
    expect(countTimesTwo).toBe(2);
    done();
  };

  subscribe(subscriber, 'countTimesTwo');
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
