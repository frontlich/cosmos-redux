import {
  Action,
  AnyAction,
  combineReducers,
  configureStore,
  ConfigureStoreOptions,
  EnhancedStore,
  Reducer,
  ReducersMapObject,
} from '@reduxjs/toolkit';

import plugin from './plugin';
import { FunctionParam, Middlewares, ReduxApp } from './types';

export * from './plugins';
export * from './hooks';
export * from './thunks';
export * from './selectors';
export * from './model';

interface StoreOptions<
  S = any,
  A extends Action = AnyAction,
  M extends Middlewares<S> = Middlewares<S>
> extends ConfigureStoreOptions<S, A, M> {
  reducer: ReducersMapObject<S, A>;
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
  const pluginEnhancers = plugin.get('enhancers');

  const reducers = Object.assign({}, ...pluginReducer, reducer || {});

  const store = configureStore({
    reducer: combineReducers(reducers),

    middleware: (typeof middleware === 'function'
      ? (getDefaultMiddleware: any) => {
          const curriedGetMiddleware = (
            option: FunctionParam<typeof getDefaultMiddleware>
          ) => getDefaultMiddleware(option).concat(pluginMiddleware);

          return middleware(curriedGetMiddleware);
        }
      : [...pluginMiddleware, ...(middleware || [])]) as any,

    devTools,

    preloadedState: Object.assign({}, ...pluginPreloadState, preloadedState),

    enhancers: (typeof enhancers === 'function'
      ? (defaultEnhancers: any) =>
          enhancers([...defaultEnhancers, ...pluginEnhancers] as any[])
      : [...pluginEnhancers, ...enhancers]) as any,
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
      return store || configStore(options);
    },
    injectSlice(slice) {
      if (process.env.NODE_ENV === 'development') {
        if (!store) {
          throw new Error('this method cannot be used before complete');
        }
      }

      if (asyncReducers[slice.name]) {
        // 防止重复注入
        return this;
      }

      asyncReducers[slice.name] = slice.reducer;

      const reducer = combineReducers({
        ...(store as any).__reducers,
        ...asyncReducers,
      }) as any;

      store.replaceReducer(reducer);
      return this;
    },
    injectModel(model) {
      return this.injectSlice(model);
    },

    /** @deprecated */
    useSlice(slice) {
      return this.injectSlice(slice);
    },
    /** @deprecated */
    useModel(model) {
      return this.injectModel(model);
    },
  };
};
