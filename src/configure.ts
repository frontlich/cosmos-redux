import {
  Action,
  AnyAction,
  combineReducers,
  configureStore,
  ConfigureStoreOptions,
  createSlice,
  EnhancedStore,
  Reducer,
  ReducersMapObject,
} from '@reduxjs/toolkit';

import { defaultReducer } from './constant/utils';
import { createModel } from './model';
import plugin from './plugin';
import { Middlewares, ReduxApp } from './types';

interface StoreOptions<
  S = any,
  A extends Action = AnyAction,
  M extends Middlewares<S> = Middlewares<S>
> extends Partial<ConfigureStoreOptions<S, A, M>> {
  reducer?: ReducersMapObject<S, A>;
}

export const configStore = <
  S = any,
  A extends Action = AnyAction,
  M extends Middlewares<S> = Middlewares<S>
>(
  options?: StoreOptions<S, A, M>
): EnhancedStore<S, A, M> => {
  const { reducer, middleware, devTools, preloadedState = {}, enhancers = [] } =
    options || {};

  const pluginReducer = plugin.get('reducer');
  const pluginMiddleware = plugin.get('middleware');
  const pluginPreloadState = plugin.get('preloadState');
  /** @deprecated */
  const _pluginEnhancers = plugin.get('enhancers');
  const pluginEnhancers = plugin.get('enhancer');

  const reducers = Object.assign({}, ...pluginReducer, reducer || {});

  const finalReducer =
    Object.keys(reducers).length > 0
      ? combineReducers(reducers)
      : defaultReducer;

  const store = configureStore({
    reducer: finalReducer,

    middleware: getDefaultMiddleware => {
      if (typeof middleware === 'function') {
        return middleware(
          options =>
            [...getDefaultMiddleware(options), ...pluginMiddleware] as any
        );
      } else {
        return [
          ...getDefaultMiddleware(),
          ...pluginMiddleware,
          ...(Array.isArray(middleware) ? middleware : []),
        ] as any;
      }
    },

    devTools,

    preloadedState: Object.assign({}, ...pluginPreloadState, preloadedState),

    enhancers: (typeof enhancers === 'function'
      ? (defaultEnhancers: any) =>
          enhancers([...defaultEnhancers, ...pluginEnhancers] as any[])
      : [..._pluginEnhancers, ...pluginEnhancers, ...enhancers]) as any,
  });

  return { ...store, __reducers: reducers } as any;
};

export const configReduxApp = <
  S = any,
  A extends Action = AnyAction,
  M extends Middlewares<S> = Middlewares<S>
>(
  options?: StoreOptions<S, A, M>
): ReduxApp<S, A, M> => {
  let store: EnhancedStore<S, A, M>;
  const asyncReducers: Record<string, Reducer> = {};

  return {
    addPlugin(p) {
      plugin.add(p);
      return this;
    },
    complete(cb) {
      store = configStore(options);
      typeof cb === 'function' && cb();
      return this;
    },
    getStore() {
      return store || (store = configStore(options));
    },
    createSlice(options) {
      const slice = createSlice(options);
      this.injectSlice(slice);
      return slice;
    },
    createModel(options) {
      const model = createModel(options);
      this.injectModel(model);
      return model;
    },
    addReducer(name, reducer) {
      if (process.env.NODE_ENV === 'development') {
        if (!store) {
          throw new Error('this method cannot be used before complete');
        }
      }

      const initialReducers = (store as any).__reducers;

      if (asyncReducers[name]) {
        // 防止重复注入
        return this;
      }

      if (process.env.NODE_ENV === 'development') {
        if (initialReducers[name] && initialReducers[name] !== defaultReducer) {
          console.warn(`初始的reducer: ${name} 被覆盖了`);
        }
      }

      asyncReducers[name] = reducer;

      const allRreducer = combineReducers({
        ...initialReducers,
        ...asyncReducers,
      }) as Reducer;

      store.replaceReducer(allRreducer);
      return this;
    },
    removeReducer(name) {
      const initialReducers = (store as any).__reducers;

      const replace = () => {
        const allRreducer = combineReducers({
          ...initialReducers,
          ...asyncReducers,
        }) as Reducer;

        store.replaceReducer(allRreducer);
      };

      if (asyncReducers[name]) {
        delete asyncReducers[name];
        replace();
        return this;
      }

      if (initialReducers[name]) {
        delete initialReducers[name];
        replace();
        return this;
      }

      console.warn(`${name}对应的reducer不存在`);
      return this;
    },
    injectSlice(slice) {
      return this.addReducer(slice.name, slice.reducer);
    },
    injectModel(model) {
      return this.addReducer(model.name, model.reducer);
    },
  };
};
