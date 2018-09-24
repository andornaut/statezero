import { defineGetter, getState } from '../src';
import {
  clearStateThenResolve, getCountTimesTwo, incrementCount, incrementNestedCount,
} from './helpers';

describe('defineGetter()', () => {
  beforeEach(clearStateThenResolve);

  describe('getters are added after an action', () => {
    it('should return the updated state', () => {
      incrementCount();

      defineGetter('countTimesTwo', getCountTimesTwo);

      const { count, countTimesTwo } = getState();
      expect(countTimesTwo).to.equal(count * 2);
      expect(countTimesTwo).to.equal(2);
    });
  });

  describe('getters added before an action is called', () => {
    it('should return the updated state', () => {
      defineGetter('countTimesTwo', getCountTimesTwo);

      incrementCount();
      incrementCount();

      const { count, countTimesTwo } = getState();
      expect(countTimesTwo).to.equal(count * 2);
      expect(countTimesTwo).to.equal(4);
    });
  });

  describe('getter is defined with default options', () => {
    it('is not enumerable', () => {
      defineGetter('nested.enumerable', () => null);

      const { nested } = getState();
      const { enumerable } = Object.getOwnPropertyDescriptor(nested, 'enumerable');

      expect(enumerable).to.be.false;
    });
  });

  describe('getters defined with enumerable=true', () => {
    it('is enumerable', () => {
      defineGetter('nested.enumerable', () => null, true);

      const { nested } = getState();
      const { enumerable } = Object.getOwnPropertyDescriptor(nested, 'enumerable');

      expect(enumerable).to.be.true;
    });
  });

  describe('nested getters added after an action is called', () => {
    it('should return the updated state', () => {
      incrementNestedCount();

      defineGetter('nested.countTimesTwo', getCountTimesTwo);

      expect(getState().nested.countTimesTwo).to.equal(2);
    });
  });

  describe('nested getters added before an action is called', () => {
    it('should return the updated state', () => {
      defineGetter('nested.countTimesTwo', getCountTimesTwo);

      incrementNestedCount();
      incrementNestedCount();

      const { count, countTimesTwo } = getState().nested;
      expect(countTimesTwo).to.equal(count * 2);
      expect(countTimesTwo).to.equal(4);
    });
  });

  describe('nested getters', () => {
    it('should be able to access top-level state', () => {
      incrementCount();

      defineGetter('nested.topLevelCount', (_, state) => state.count);

      expect(getState().nested.topLevelCount).to.equal(1);
    });
  });

  describe('nested getters top-level state', () => {
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
