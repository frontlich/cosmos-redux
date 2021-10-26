import { createDraftSafeSelector } from '@reduxjs/toolkit';

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

  const getSelector = (currState: any, preSelector: (s: any) => any) => {
    const selectorMap = {} as any;
    // eslint-disable-next-line no-restricted-syntax
    for (const key in currState) {
      if (Object.prototype.hasOwnProperty.call(currState, key)) {
        const value = currState[key];
        const currSelector: any = createDraftSafeSelector(preSelector, s => s[key]);

        if (typeof value === 'object' && value !== null) {
          if (process.env.NODE_ENV === 'development') {
            if (key in currSelector) {
              throw new Error(`创建selectors时，state中的属性名不能为${key}`);
            }
          }
          selectorMap[key] = Object.assign(
            currSelector,
            getSelector(value, currSelector)
          );
        } else {
          selectorMap[key] = currSelector;
        }
      }
    }

    return selectorMap;
  };

  return getSelector(initialState, rootSelector);
};
