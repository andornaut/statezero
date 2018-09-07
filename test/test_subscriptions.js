const {
  defineGetter,
  getState,
  subscribe,
  subscribeSync,
  unsubscribe,
  unsubscribeAll,
} = require('../dist/statezero.umd');
const {
  assignState,
  getCountTimesTwo,
  incrementCount,
  incrementCountAndDeeplyNestedCount,
  resetState,
} = require('./helpers');

beforeEach((done) => {
  subscribe(() => {
    done();
  });
  resetState();
});

afterEach(unsubscribeAll);

test('subscribersAsync on getters are called the expected number times', (done) => {
  defineGetter('countTimesTwo', getCountTimesTwo);

  // Set timeout here to let the defineGetter() state change notification to fire before subscribing
  setTimeout(() => {
    let calledCount = 0;
    const subscriber = () => {
      calledCount += 1;
    };

    subscribe(subscriber, 'countTimesTwo');
    incrementCount();
    setTimeout(() => {
      incrementCount();
      setTimeout(() => {
        expect(calledCount).toBe(2);
        done();
      });
    });
  });
});

test('subscribersAsync on non-getters are called the expected number times', (done) => {
  let calledCount = 0;
  const subscriber = () => {
    calledCount += 1;
  };

  subscribe(subscriber, 'count');

  incrementCount();
  setTimeout(() => {
    incrementCount();
    setTimeout(() => {
      expect(calledCount).toBe(2);
      done();
    });
  });
});

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

test('string-filtered notification are batched', (done) => {
  const subscriber = (state) => {
    expect(state).toBe(3);
    done();
  };

  subscribe(subscriber, 'count');
  incrementCount();
  incrementCount();
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

test('string-filtered subscriber is notified when function changes', (done) => {
  const fn = () => 1;

  const subscriber = (state) => {
    expect(state).toBe(fn);
    done();
  };

  subscribe(subscriber, 'fn');
  assignState({ fn });
});

test('string-filtered subscriber prevState argument is the initial value from the same "tick"', (done) => {
  const subscriber = (initial, prevInitial) => {
    expect(initial).toBe(true);
    expect(prevInitial).toBeUndefined();
    done();
  };

  // state.initial is undefined initially in this "tick".
  assignState({ initial: true });
  subscribe(subscriber, 'initial');
  assignState({ initial: false });
  assignState({ initial: true });
});

test('subscriberSync subscriber is called synchronously', () => {
  let calledWithVal;
  const subscriber = (val) => {
    calledWithVal = val;
  };

  subscribeSync(subscriber, 'val');
  assignState({ val: true });
  expect(calledWithVal).toBe(true);
});

test.each([null, 0, 1, {}])('subscribe called with invalid "filter" argument throws error', (filter) => {
  expect(() => {
    subscribe(() => null, filter);
  }).toThrow();
});

test('unfiltered subscriber is notified once when a change is made then reverted', (done) => {
  const subscriber = ({ initial }, { prevInitial }) => {
    expect(initial).toBe(true);
    expect(prevInitial).toBeUndefined();
    done();
  };

  assignState({ initial: true });
  subscribe(subscriber);
  assignState({ initial: false });
  assignState({ initial: true });
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
