import { Plugin } from '../types';

const defaultStorageToken = '$$reduxStoreState';

interface Storage {
  set(key: string, v: object): void;
  get(key: string): void;
}

interface StorageConfig {
  storageKey?: string;
  storage?: Storage;
  include?: string[];
  exclude?: string[]
};

const session = {
  set(key: string, v: object) {
    sessionStorage.setItem(key, JSON.stringify(v));
  },

  get(key: string) {
    return JSON.parse(sessionStorage.getItem(key) || '{}');
  },
};

export function createStoragePlugin(config: StorageConfig): Plugin {
  const {
    storageKey = defaultStorageToken,
    storage = session,
    include = [],
    exclude = [],
  } = config || {};
  return {
    preloadState: storage.get(storageKey),
    enhancers: next => (...args) => {
      const store = next(...args);
      store.subscribe(() => {
        const state: any = store.getState();
        
        if (include && include.length) {
          const cache: any = {};
          include.forEach(key => cache[key] = state[key])
          storage.set(storageKey, cache);
          return;
        }

        if (exclude && exclude.length) {
          const cache: any = {};
          Object.keys(state).forEach(key => {
            if (exclude.indexOf(key) === -1) {
              cache[key] = state[key];
            }
          });
          storage.set(storageKey, cache);
        }
      });
      return store;
    },
  };
}

/** 将store数据缓存到本地的插件 */
export const storagePlugin = createStoragePlugin({exclude: []});
