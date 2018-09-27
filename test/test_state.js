import { action, getState } from '../src';
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

  describe('when a "path" argument is supplied and is valid', () => {
    it('should return the state at the given path', () => {
      incrementNestedCount();

      expect(getState('nested.count')).to.equal(1);
    });
  });

  describe('when a "path" argument is supplied and is not valid', () => {
    it('should return undefined', () => {
      expect(getState('invalid.path')).to.be.undefined;
    });
  });
});
