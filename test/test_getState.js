import { getState } from '../src';
import { clearStateThenResolve, incrementCount, incrementNestedCount } from './helpers';

describe('getState()', () => {
  beforeEach(clearStateThenResolve);

  describe('attempt to mutate top-level state', () => {
    it('should be unchanged', () => {
      incrementCount();

      expect(() => {
        getState().count = 2;
      }).to.throw();
    });
  });

  describe('attempt to mutate nested state', () => {
    it('should be unchanged', () => {
      incrementNestedCount();

      expect(() => {
        getState().nested.count = 2;
      }).to.throw();
    });
  });
});
