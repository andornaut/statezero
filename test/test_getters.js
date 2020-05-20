import { getState } from '../src';
import { defineGetter } from '../src/getters';
import {
  clearStateThenResolve, getCountTimesTwo, incrementCount, incrementNestedCount,
} from './helpers';

describe('defineGetter()', () => {
  beforeEach(clearStateThenResolve);

  describe('when a getter is defined after calling action', () => {
    it('should return the updated state', () => {
      incrementCount();
      defineGetter('countTimesTwo', getCountTimesTwo);

      const { count, countTimesTwo } = getState();

      expect(countTimesTwo).to.equal(count * 2);
      expect(countTimesTwo).to.equal(2);
    });
  });

  describe('when a getter is defined before calling an action', () => {
    it('should return the updated state', () => {
      defineGetter('countTimesTwo', getCountTimesTwo);
      incrementCount();
      incrementCount();

      const { count, countTimesTwo } = getState();

      expect(countTimesTwo).to.equal(count * 2);
      expect(countTimesTwo).to.equal(4);
    });
  });

  describe('when a getter is defined with default options', () => {
    it('should not be enumerable', () => {
      defineGetter('nested.enumerable', () => null);

      const { nested } = getState();
      const { enumerable } = Object.getOwnPropertyDescriptor(nested, 'enumerable');

      expect(enumerable).to.be.false;
    });
  });

  describe('when a getter is defined with enumerable=true', () => {
    it('should be enumerable', () => {
      defineGetter('nested.enumerable', () => null, true);

      const { nested } = getState();
      const { enumerable } = Object.getOwnPropertyDescriptor(nested, 'enumerable');

      expect(enumerable).to.be.true;
    });
  });

  describe('when a nested getter is defined after calling an action', () => {
    it('should return the updated state', () => {
      incrementNestedCount();
      defineGetter('nested.countTimesTwo', getCountTimesTwo);

      expect(getState().nested.countTimesTwo).to.equal(2);
    });
  });

  describe('when a nested getter is defined before calling an action', () => {
    it('should return the updated state', () => {
      defineGetter('nested.countTimesTwo', getCountTimesTwo);
      incrementNestedCount();
      incrementNestedCount();

      const { count, countTimesTwo } = getState().nested;
      expect(countTimesTwo).to.equal(count * 2);
      expect(countTimesTwo).to.equal(4);
    });
  });

  describe('when a nested getter is defined', () => {
    it('should be able to access the root state', () => {
      incrementCount();
      defineGetter('nested.topLevelCount', (_, state) => state.count);

      expect(getState().nested.topLevelCount).to.equal(1);
    });
  });

  describe('when a nested getter accesses the root state', () => {
    it('should be immutable', () => {
      incrementCount();

      defineGetter('nested.topLevelCount', (_, state) => state.count);

      const originalNested = getState().nested;
      expect(originalNested.topLevelCount).to.equal(1);

      incrementCount();
      expect(getState().nested.topLevelCount).to.equal(2);

      incrementCount();
      expect(getState().nested.topLevelCount).to.equal(3);

      expect(originalNested.topLevelCount).to.equal(1);
    });
  });
});
