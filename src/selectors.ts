import { createSelector } from '@reduxjs/toolkit';

type SelectorMap<T> = { [K in keyof T]: (state: T) => T[K] };

export const createSelectors = <T>(name: string, initialState: T) => {
  const selectorMap = {} as SelectorMap<T>;

  // eslint-disable-next-line no-restricted-syntax
  for (const key in initialState) {
    if (Object.prototype.hasOwnProperty.call(initialState, key)) {
      const selector = createSelector(
        (state: any) => state[name],
        (s) => s[key],
      );
      selectorMap[key] = selector;
    }
  }

  return selectorMap;
};
