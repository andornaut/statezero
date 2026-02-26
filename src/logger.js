import deepDiff from "deep-diff";

import { subscribe, unsubscribe } from "./subscriptions";

let subscription;

const CHANGE_TYPES = {
  A: "Array changed",
  D: "Deleted",
  E: "Changed",
  N: "New",
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
  logger(properties, ["changeType", "from", "to"]);
};

export const startLogging = (selector, logger) => {
  if (subscription) {
    // Logger has already started.
    return;
  }

  subscription = subscribe(createDiffLogger(logger || console.table), selector);
};

export const stopLogging = () => {
  if (!subscription) {
    return;
  }
  unsubscribe(subscription);
  subscription = null;
};
