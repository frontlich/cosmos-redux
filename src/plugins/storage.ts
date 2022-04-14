import type { Reducer } from '@reduxjs/toolkit';

import { defaultReducer } from '../constant/utils';

import type { Plugin } from '../types';

interface Storage {
  readonly storageKey: string;
  set(v: object): void;
  get(): any;
  remove(): void;
}

interface StorageConfig {
  enable?: boolean;
  storage?: Storage;
  include?: string[];
  exclude?: string[];
}

const session: Storage = {
  storageKey: '$$reduxStoreState',

  set(v: object) {
    sessionStorage.setItem(this.storageKey, JSON.stringify(v));
  },

  get() {
    return JSON.parse(sessionStorage.getItem(this.storageKey) || '{}');
  },

  remove() {
    sessionStorage.removeItem(this.storageKey);
  }
};

export function createStoragePlugin(config?: StorageConfig): Plugin {
  const {
    enable = true,
    storage = session,
    include = [],
    exclude = [],
  } = config || {};

  if (!enable) {
    storage.remove();
    return {};
  }

  const initialState = storage.get();

  const reducer: Record<string, Reducer> = {};
  for (const key in initialState) {
    reducer[key] = defaultReducer;
  }

  return {
    preloadState: initialState,
    reducer,
    enhancer: next => (...args) => {
      const store = next(...args);
      store.subscribe(() => {
        const state: any = store.getState();

        if (include && include.length) {
          const cache: any = {};
          include.forEach(key => (cache[key] = state[key]));
          storage.set(cache);
          return;
        }

        if (exclude && exclude.length) {
          const cache: any = {};
          Object.keys(state).forEach(key => {
            if (exclude.indexOf(key) === -1) {
              cache[key] = state[key];
            }
          });
          storage.set(cache);
        }
      });
      return store;
    },
  };
}

/** 将store数据缓存到本地的插件 */
export const storagePlugin = createStoragePlugin();
