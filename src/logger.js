import deepDiff from 'deep-diff';

import { subscribe, unsubscribe } from './subscriptions';

let subscription;

// Ignore extra args to log() when using `console.log` fallback
// eslint-disable-next-line no-console
let log = console.table ? console.table : (message) => console.log(message);

const CHANGE_TYPES = {
  N: 'New',
  D: 'Deleted',
  E: 'Changed',
  A: 'Array changed',
};

const logStateChanges = (state, prevState) => {
  const properties = {};
  const differences = deepDiff(prevState, state);
  if (differences === undefined) {
    return;
  }
  for (const difference of differences) {
    const { path } = difference;
    properties[path] = {
      changeType: CHANGE_TYPES[difference.kind],
      from: difference.lhs,
      to: difference.rhs,
    };
  }
  log(properties, ['changeType', 'from', 'to']);
};

export const startLogging = (selector, logger) => {
  if (logger) {
    log = logger;
  }
  subscription = subscribe(logStateChanges, selector);
};

export const stopLogging = () => {
  unsubscribe(subscription);
};
