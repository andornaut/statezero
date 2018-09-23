import sinon from 'sinon';

import {
  defineGetter, getState, subscribe, subscribeSync, unsubscribe,
} from '../src';
import {
  assignState,
  clearStateThenResolve,
  getCountTimesTwo,
  incrementCount,
  incrementCountAndDeeplyNestedCount,
} from './helpers';

describe('subscribe()', () => {
  beforeEach(clearStateThenResolve);

  describe('is called on a getter', () => {
    it('should invoke the callback the expected number times', (done) => {
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
            expect(calledCount).to.equal(2);
            done();
          });
        });
      });
    });
  });

  describe('is called on a non-getter', () => {
    it('should invoke the callback the expected number times', (done) => {
      let calledCount = 0;
      const subscriber = () => {
        calledCount += 1;
      };

      subscribe(subscriber, 'count');

      incrementCount();
      setTimeout(() => {
        incrementCount();
        setTimeout(() => {
          expect(calledCount).to.equal(2);
          done();
        });
      });
    });
  });

  describe('is called with an array', () => {
    it('should invoke the callback with an array', (done) => {
      const subscriber = ([count]) => {
        expect(count).to.equal(1);
        done();
      };

      subscribe(subscriber, ['count']);
      incrementCount();
    });
  });

  describe('is called with a 2-element array', () => {
    it('should invoke the callback with a 2-element array', (done) => {
      defineGetter('countTimesTwo', getCountTimesTwo);

      const subscriber = ([count, countTimesTwo]) => {
        expect(count).to.equal(1);
        expect(countTimesTwo).to.equal(2);
        done();
      };

      subscribe(subscriber, ['count', 'countTimesTwo']);
      incrementCount();
    });
  });

  describe('is called with an array with deeply nested path', () => {
    it('should invoke the callback with a nested property', (done) => {
      defineGetter('countTimesTwo', getCountTimesTwo);
      defineGetter('deeply.nested.countTimesTwo', getCountTimesTwo);

      const subscriber = ([count, countTimesTwo, nestedCount, nestedCountTimesTwo]) => {
        expect(count).to.equal(2);
        expect(countTimesTwo).to.equal(4);
        expect(nestedCount).to.equal(1);
        expect(nestedCountTimesTwo).to.equal(2);
        done();
      };

      incrementCount();
      subscribe(subscriber, ['count', 'countTimesTwo', 'deeply.nested.count', 'deeply.nested.countTimesTwo']);
      incrementCountAndDeeplyNestedCount();
    });
  });

  describe('is called with an array as above but in an inverted order', () => {
    it('should invoke the callback with an array with elements in an inverted order', (done) => {
      defineGetter('countTimesTwo', getCountTimesTwo);
      defineGetter('deeply.nested.countTimesTwo', getCountTimesTwo);

      const subscriber = ([nestedCountTimesTwo, nestedCount, countTimesTwo, count]) => {
        expect(count).to.equal(2);
        expect(countTimesTwo).to.equal(4);
        expect(nestedCount).to.equal(1);
        expect(nestedCountTimesTwo).to.equal(2);
        done();
      };

      incrementCount();
      subscribe(subscriber, ['deeply.nested.countTimesTwo', 'deeply.nested.count', 'countTimesTwo', 'count']);
      incrementCountAndDeeplyNestedCount();
    });
  });

  describe('is called with a path to a getter', () => {
    it("should invoke the callback with the getter's value", (done) => {
      defineGetter('countTimesTwo', getCountTimesTwo);

      const subscriber = (countTimesTwo) => {
        expect(countTimesTwo).to.equal(getState().count * 2);
        expect(countTimesTwo).to.equal(2);
        done();
      };

      subscribe(subscriber, 'countTimesTwo');
      incrementCount();
    });
  });

  describe('called with a string path and then multiple actions are invoked', () => {
    it('should only call the callback once', (done) => {
      const subscriber = (state) => {
        expect(state).to.equal(3);
        done();
      };

      subscribe(subscriber, 'count');
      incrementCount();
      incrementCount();
      incrementCount();
    });
  });

  describe('is called with a string path', () => {
    it('should invoke the callback with the value at the given path', (done) => {
      const subscriber = (state) => {
        expect(state).to.equal(1);
        done();
      };

      subscribe(subscriber, 'count');
      incrementCount();
    });
  });

  describe('is called with a string path to a function', () => {
    it('should invoke the callback when the function is changed', (done) => {
      const fn = () => 1;

      const subscriber = (state) => {
        expect(state).to.equal(fn);
        done();
      };

      subscribe(subscriber, 'fn');
      assignState({ fn });
    });
  });

  describe('is called with a string path and then state is initialized and then multiple actions are invoked,', () => {
    it('prevState argument is the initial value from the same "tick"', (done) => {
      const subscriber = (initial, prevInitial) => {
        expect(initial).to.be.true;
        expect(prevInitial).to.be.undefined;
        done();
      };

      // state.initial is undefined initially in this "tick".
      assignState({ initial: true });
      subscribe(subscriber, 'initial');
      assignState({ initial: false });
      assignState({ initial: true });
    });
  });

  describe('is called with invalid "filter" argument', () => {
    [null, 0, 1, {}].forEach((filter) => {
      it(`throws error when filter: ${filter}`, () => {
        expect(() => {
          subscribe(() => null, filter);
        }).to.throw();
      });
    });
  });

  describe('is called without a filter argument, then an action is committed then reverted', () => {
    it('should invoke the callback when the change is reverted', (done) => {
      const subscriber = ({ initial }, { prevInitial }) => {
        expect(initial).to.be.true;
        expect(prevInitial).to.be.undefined;
        done();
      };

      assignState({ initial: true });
      subscribe(subscriber);
      assignState({ initial: false });
      assignState({ initial: true });
    });
  });

  describe('is called without a filter argument', () => {
    it('should invoke the callback when a change occurs', (done) => {
      const subscriber = (state) => {
        expect(state.count).to.equal(1);
        done();
      };

      subscribe(subscriber);
      incrementCount();
    });
  });
});

describe('subscribeSync()', () => {
  describe('is called', () => {
    it('should call the callback immediately', () => {
      let calledWithVal;
      const subscriber = (val) => {
        calledWithVal = val;
      };

      subscribeSync(subscriber, 'val');
      assignState({ val: true });
      expect(calledWithVal).to.be.true;
    });
  });
});

describe('unsubscribe() is called on a path-filtered subscription', () => {
  describe('unsubscribes the subscription', (done) => {
    const subscriber = sinon.spy();
    const subscription = subscribe(subscriber, 'count');

    unsubscribe(subscription);
    incrementCount();

    setTimeout(() => {
      expect(subscriber).not.have.been.called;
      done();
    }, 1);
  });
});

describe('unsubscribe() is called on an unfiltered subscription', () => {
  describe('unsubscribes the subscription', (done) => {
    const subscriber = sinon.spy();
    subscribe(subscriber);

    unsubscribe(subscriber);
    incrementCount();

    setTimeout(() => {
      expect(subscriber).not.have.been.called;
      done();
    }, 1);
  });
});
