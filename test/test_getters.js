const { defineGetter, getState, subscribe } = require('../dist/statezero.umd');
const {
  getCountTimesTwo, incrementCount, incrementNestedCount, resetState,
} = require('./helpers');

beforeEach((done) => {
  subscribe(() => {
    done();
  });
  resetState();
});

test('getters added after an action is called return the updated state', () => {
  incrementCount();

  defineGetter('countTimesTwo', getCountTimesTwo);

  const { count, countTimesTwo } = getState();
  expect(countTimesTwo).toBe(count * 2);
  expect(countTimesTwo).toBe(2);
});

test('getters added before an action is called return the updated state', () => {
  defineGetter('countTimesTwo', getCountTimesTwo);

  incrementCount();
  incrementCount();

  const { count, countTimesTwo } = getState();
  expect(countTimesTwo).toBe(count * 2);
  expect(countTimesTwo).toBe(4);
});

test('nested getters added after an action is called return the updated state', () => {
  incrementNestedCount();

  defineGetter('nested.countTimesTwo', getCountTimesTwo);

  expect(getState().nested.countTimesTwo).toBe(2);
});

test('nested getters added before an action is called return the updated state', () => {
  defineGetter('nested.countTimesTwo', getCountTimesTwo);

  incrementNestedCount();
  incrementNestedCount();

  const { count, countTimesTwo } = getState().nested;
  expect(countTimesTwo).toBe(count * 2);
  expect(countTimesTwo).toBe(4);
});
