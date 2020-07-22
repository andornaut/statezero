import deepDiff from 'deep-diff';

import { subscribe, unsubscribe } from './subscriptions';

let subscription;

// Ignore extra args to log() when using `console.log` fallback
function fallbackLogger(message) {
  // eslint-disable-next-line no-console
  console.log(message);
}

// eslint-disable-next-line no-console
const DEFAULT_LOGGER = console.table ? console.table : fallbackLogger;

const CHANGE_TYPES = {
  N: 'New',
  D: 'Deleted',
  E: 'Changed',
  A: 'Array changed',
};

let log = DEFAULT_LOGGER;

function logStateChanges(state, prevState) {
  const differences = deepDiff(prevState, state);
  if (differences === undefined) {
    return;
  }
  const properties = differences.reduce(function (accumulator, difference) {
    accumulator[difference.path] = {
      changeType: CHANGE_TYPES[difference.kind],
      from: difference.lhs,
      to: difference.rhs,
    };
    return accumulator;
  }, {});
  log(properties, ['changeType', 'from', 'to']);
}

export function startLogging(selector, logger) {
  if (subscription) {
    // Logger has already started.
    return;
  }
  log = logger || DEFAULT_LOGGER;
  subscription = subscribe(logStateChanges, selector);
}

export function stopLogging() {
  unsubscribe(subscription);
  subscription = null;
}
