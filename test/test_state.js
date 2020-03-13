import {
  action, getState, setImmutableState, setState,
} from '../src';
import { clearStateThenResolve, incrementCount, incrementNestedCount } from './helpers';

function Foo() {}

describe('action()', () => {
  beforeEach(clearStateThenResolve);

  describe('when called', () => {
    it('should update the state', () => {
      incrementCount();

      expect(getState().count).to.equal(1);
    });
  });

  describe('when commit is called with invalid "nextState" argument', () => {
    [new Foo(), null, undefined, 0, 1, []].forEach((nextState) => {
      it(`should throw an error. nextState: ${nextState}`, () => {
        action(({ commit }) => {
          expect(() => {
            commit(nextState);
          }).to.throw();
        })();
      });
    });
  });
});

describe('getState()', () => {
  beforeEach(clearStateThenResolve);

  describe('when attempting to assign a new value to a state property', () => {
    it('should throw an error', () => {
      incrementCount();

      expect(() => {
        getState().count = 2;
      }).to.throw();
    });
  });

  describe('when attempting to assign a new value to a nested state property', () => {
    it('should throw an error', () => {
      incrementNestedCount();

      expect(() => {
        getState().nested.count = 2;
      }).to.throw();
    });
  });

  describe('when an array "selector" argument is supplied', () => {
    it('should return the state at the given path', () => {
      incrementCount();
      incrementNestedCount();

      expect(getState(['nested.count', 'count'])).to.have.members([1, 1]);
    });
  });

  describe('when an function "selector" argument is supplied', () => {
    it('should return the state at the given path', () => {
      incrementNestedCount();

      const selector = (state) => state.nested.count;

      expect(getState(selector)).to.equal(1);
    });
  });

  describe('when a string "selector" argument is supplied', () => {
    it('should return the state at the given path', () => {
      incrementNestedCount();

      expect(getState('nested.count')).to.equal(1);
    });
  });

  describe('when a non-existent string "selector" argument is supplied', () => {
    it('should return undefined', () => {
      expect(getState('invalid.path')).to.be.undefined;
    });
  });

  describe('when an unsupported type "selector" argument is supplied', () => {
    it('should throw an error', () => {
      expect(() => getState({})).to.throw(Error, /statezero: getState\(\) must be called with/);
    });
  });
});

describe('setState()', () => {
  beforeEach(clearStateThenResolve);

  describe('when supplied an empty-string selector argument', () => {
    it('should replace the entire state', () => {
      const newState = {};

      setState('', newState);

      expect(getState()).to.equal(newState);
    });
  });

  describe('when supplied a string path selector argument', () => {
    it('should replace the value at the given path', () => {
      setState('a.b.c', 'C');

      expect(getState().a.b.c).to.equal('C');
    });
  });
});

describe('setImmutableState()', () => {
  beforeEach(clearStateThenResolve);

  describe('when an immutable object is mutated with setImmutableState', () => {
    it('should not mutate the object', () => {
      const initial = { initial: true };
      setImmutableState('immutable', initial);
      setImmutableState('immutable.initial', {});
      expect(getState().immutable.initial, initial);
    });
  });

  describe('when an immutable object is mutated with setState', () => {
    it('should not mutate the object', () => {
      const initial = { initial: true };
      setImmutableState('immutable', initial);
      setState('immutable.initial', {});
      expect(getState().immutable.initial, initial);
    });
  });

  describe('when an immutable object is replaced', () => {
    it('the new object will not be immutable', () => {
      setImmutableState('immutable', { initial: true });
      setState('immutable', { initial: false });
      expect(getState().immutable.initial, false);
    });
  });
});
