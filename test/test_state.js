import { action, getState } from '../src';
import { clearStateThenResolve, incrementCount, incrementNestedCount } from './helpers';

function Foo() {}

describe('action()', () => {
  beforeEach(clearStateThenResolve);

  it('mutates state', () => {
    incrementCount();

    expect(getState().count).to.equal(1);
  });

  describe('commit called with invalid "nextState" argument throw an error', () => {
    [new Foo(), null, undefined, 0, 1, []].forEach((nextState) => {
      it(`nextState: ${nextState}`, () => {
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

  describe('attempt to mutate top-level state', () => {
    it('should throw an error', () => {
      incrementCount();

      expect(() => {
        getState().count = 2;
      }).to.throw();
    });
  });

  describe('attempt to mutate nested state', () => {
    it('should throw an error', () => {
      incrementNestedCount();

      expect(() => {
        getState().nested.count = 2;
      }).to.throw();
    });
  });

  describe('when a "path" argument is supplied and valid', () => {
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
