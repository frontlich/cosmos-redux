import { Plugin } from '../types';

const defaultStorageToken = '$$reduxStoreState';

interface Storage {
  set(key: string, v: object): void;
  get(key: string): void;
}

interface StorageConfig {
  storageKey?: string;
  storage?: Storage;
}

const session = {
  set(key: string, v: object) {
    sessionStorage.setItem(key, JSON.stringify(v));
  },
  
  get(key: string) {
    return JSON.parse(sessionStorage.getItem(key) || '{}');
  }
}

export const createStoragePlugin = (config?: StorageConfig): Plugin => {
  const { storageKey = defaultStorageToken, storage = session } = config || {};
  return {
    preloadState: storage.get(storageKey),
    enhancers: (next) => (...args) => {
      const store = next(...args);
      store.subscribe(() => {
        storage.set(storageKey, store.getState());
      });
      return store;
    }
  };
};

/** 将store数据缓存到本地的插件 */
export const storagePlugin = createStoragePlugin();
