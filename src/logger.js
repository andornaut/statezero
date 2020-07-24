import deepDiff from 'deep-diff';

import { subscribe, unsubscribe } from './subscriptions';

let subscription;

const CHANGE_TYPES = {
  N: 'New',
  D: 'Deleted',
  E: 'Changed',
  A: 'Array changed',
};

const createDiffLogger = (logger) => (state, prevState) => {
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
  logger(properties, ['changeType', 'from', 'to']);
};

const simpleLogger = (state, prevState) => {
  // eslint-disable-next-line no-console
  console.log('state changed from', prevState, 'to', state);
};

export const startLogging = (selector, logger) => {
  if (subscription) {
    // Logger has already started.
    return;
  }

  // eslint-disable-next-line no-console
  logger = console.table ? createDiffLogger(logger || console.table) : simpleLogger;
  subscription = subscribe(logger, selector);
};

export const stopLogging = () => {
  unsubscribe(subscription);
  subscription = null;
};
