import { createSelector } from '@reduxjs/toolkit';

type SelectorMap<T, S> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? SelectorMap<T[K], S> & ((state: S) => T[K])
    : (state: S) => T[K];
};

export const createSelectors = <T, State = any>(
  name: string,
  initialState: T
): SelectorMap<T, State> => {
  const rootSelector = (state: any) => state[name];
  const selectorMap = JSON.parse(JSON.stringify(initialState));

  const getSelector = (
    currState: any,
    currMap: any,
    preSelector: (s: any) => any
  ) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in currState) {
      if (Object.prototype.hasOwnProperty.call(currState, key)) {
        const value = currState[key];
        const currSelector = createSelector(preSelector, s => s[key]);
        if (typeof value !== 'object' || value === null) {
          currMap[key] = currSelector;
        } else {
          currMap[key] = getSelector(value, currMap[key], currSelector);
        }
      }
    }
  };

  getSelector(initialState, selectorMap, rootSelector);

  return selectorMap;
};
