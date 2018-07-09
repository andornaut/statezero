const { defineGetter, getState } = require('../dist/statezero.umd');
const { incrementCount, incrementNestedCount, resetState } = require('./helpers');

beforeEach(resetState);

test('getters added after an action is called return the updated state', () => {
  incrementCount();

  defineGetter('countProp', state => state.count);

  const { count, countProp } = getState();
  expect(count).toBe(countProp);
  expect(countProp).toBe(1);
});

test('getters added before an action is called return the updated state', () => {
  defineGetter('countProp', state => state.count);

  incrementCount();
  incrementCount();

  const { count, countProp } = getState();
  expect(count).toBe(countProp);
  expect(countProp).toBe(2);
});

test('nested getters added after an action is called return the updated state', () => {
  incrementNestedCount();

  defineGetter('nested.countProp', nested => nested.count);

  expect(getState().nested.countProp).toBe(1);
});

test('nested getters added before an action is called return the updated state', () => {
  defineGetter('nested.countProp', nested => nested.count);

  incrementNestedCount();
  incrementNestedCount();

  const { count, countProp } = getState().nested;
  expect(count).toBe(countProp);
  expect(countProp).toBe(2);
});
