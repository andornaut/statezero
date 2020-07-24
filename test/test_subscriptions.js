import sinon from 'sinon';

import {
  getState, setImmutableState, setState, subscribe, subscribeSync, unsubscribe,
} from '../src';
import { defineGetter } from '../src/getters';
import {
  assignState,
  clearStateThenResolve,
  getCountTimesTwo,
  incrementCount,
  incrementCountAndDeeplyNestedCount,
} from './helpers';

describe('subscribe()', () => {
  beforeEach(clearStateThenResolve);

  describe('when called', () => {
    it('should pass the nextState, prevState and rootState to the callback', (done) => {
      const subscriber = (count, prevCount, root) => {
        expect(count).to.equal(1);
        expect(prevCount).to.equal(undefined);
        expect(root.count).to.equal(1);
        done();
      };

      subscribe(subscriber, 'count');
      incrementCount();
    });
  });

  describe('when called on a immutable object', () => {
    describe('and the object is replaced using setImmutableState', () => {
      it('should invoke the callback', (done) => {
        const subscriber = ({ initial }) => {
          expect(initial).to.be.false;
          done();
        };

        // state.initial is undefined initially in this "tick".
        setImmutableState('immutable', { initial: true });
        subscribe(subscriber, 'immutable');
        setImmutableState('immutable', { initial: false });
      });
    });

    describe('and the object is replaced using setState', () => {
      it('should invoke the callback', (done) => {
        const subscriber = ({ initial }) => {
          expect(initial).to.be.false;
          done();
        };

        // state.initial is undefined initially in this "tick".
        setImmutableState('immutable', { initial: true });
        subscribe(subscriber, 'immutable');
        setState('immutable', { initial: false });
      });
    });
  });

  describe('when called with a "selector" argument that is a path to a getter', () => {
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

  describe('when called with a "selector" argument that is a path to a getter', () => {
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

  describe('when called a "selector" argument that is path to a non-getter', () => {
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

  describe('when called with a "selector" argument that is an array', () => {
    it('should invoke the callback with an array', (done) => {
      const subscriber = ([count]) => {
        expect(count).to.equal(1);
        done();
      };

      subscribe(subscriber, ['count']);
      incrementCount();
    });
  });

  describe('when called with a "selector" argument that is a 2-element array', () => {
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

  describe('when called with a "selector" argument that is an array with a deeply nested path', () => {
    it('should invoke the callback with an array that includes the value of the deeply nested property', (done) => {
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

  describe('when called with a "selector" argument that is a string path', () => {
    it('should invoke the callback with the value at the given path', (done) => {
      const subscriber = (state) => {
        expect(state).to.equal(1);
        done();
      };

      subscribe(subscriber, 'count');
      incrementCount();
    });
  });

  describe('when called with a "selector" argument that is a string path and then multiple actions are invoked', () => {
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

  describe('when called with a string path and then state is initialized and multiple actions are invoked,', () => {
    it('should pass a prevState argument that is the initial value from the same "tick"', (done) => {
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

  describe('when called with an invalid "selector" argument', () => {
    [null, 0, 1, {}].forEach((selector) => {
      it(`should throw an error. selector: ${selector}`, () => {
        expect(() => {
          subscribe(() => null, selector);
        }).to.throw();
      });
    });
  });

  describe('when called without a selector argument, then an action is committed and reverted', () => {
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

  describe('when called without a selector argument', () => {
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
  beforeEach(clearStateThenResolve);

  describe('when called', () => {
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

describe('unsubscribe()', () => {
  beforeEach(clearStateThenResolve);

  describe('when called on subscription on a derived state', () => {
    it('should unsubscribe the subscription', (done) => {
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

  describe('when called on a subscription on the entire state', () => {
    it('should unsubscribe the subscription', (done) => {
      const subscriber = sinon.spy();
      const subscription = subscribe(subscriber);

      unsubscribe(subscription);
      incrementCount();

      setTimeout(() => {
        expect(subscriber).not.have.been.called;
        done();
      }, 1);
    });
  });
});
