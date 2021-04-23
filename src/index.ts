import {
  Action,
  AnyAction,
  combineReducers,
  configureStore,
  ConfigureStoreOptions,
  EnhancedStore,
  Middleware,
  Reducer,
  ReducersMapObject,
  Slice,
} from '@reduxjs/toolkit';

import plugin from './plugin';
import { FunctionParam, Plugin } from './types';

export * from './plugins';
export * from './hooks';
export * from './thunks';
export * from './selectors';
export * from './model';

type Middlewares<S> = ReadonlyArray<Middleware<{}, S>>;

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
  options?: StoreOptions<S, A, M>,
): EnhancedStore<S, A, M> => {
  const { reducer, middleware, devTools, preloadedState = {}, enhancers = [] } = options || {};

  const pluginReducer = plugin.get('reducer');
  const pluginMiddleware = plugin.get('middleware');
  const pluginPreloadState = plugin.get('preloadState');
  const pluginEnhancers = plugin.get('enhancers');

  const reducers = Object.assign({}, ...pluginReducer, reducer || {});

  const store = configureStore({
    reducer: combineReducers(reducers),

    middleware: (typeof middleware === 'function'
      ? (getDefaultMiddleware: any) => {
          const curriedGetMiddleware = (option: FunctionParam<typeof getDefaultMiddleware>) =>
            getDefaultMiddleware(option).concat(pluginMiddleware);

          return middleware(curriedGetMiddleware);
        }
      : [...pluginMiddleware, ...(middleware || [])]) as any,

    devTools,

    preloadedState: Object.assign({}, ...pluginPreloadState, preloadedState),

    enhancers: (typeof enhancers === 'function'
      ? (defaultEnhancers: any) => enhancers([...defaultEnhancers, ...pluginEnhancers] as any[])
      : [...pluginEnhancers, ...enhancers]) as any,
  });

  return { ...store, __reducers: reducers } as any;
};

export const configReduxApp = <
  S = any,
  A extends Action = AnyAction,
  M extends Middlewares<S> = Middlewares<S>
>(
  options?: StoreOptions<S, A, M>,
) => {
  let store: EnhancedStore<S, A, M>;
  const asyncReducers: Record<string, Reducer> = {};

  return {
    addPlugin(p: Plugin) {
      plugin.add(p);
      return this;
    },
    complete(callback?: () => void) {
      store = configStore(options);
      typeof callback === 'function' && callback();
      return this;
    },
    getStore() {
      return store || configStore(options);
    },
    useSlice(slice: Slice) {
      if (process.env.NODE_ENV === 'development') {
        if (!store) {
          throw new Error('this method cannot be used before complete');
        }
      }

      if (asyncReducers[slice.name]) {
        // 防止重复注入
        return;
      }

      asyncReducers[slice.name] = slice.reducer;

      const reducer = combineReducers({
        ...(store as any).__reducers,
        ...asyncReducers,
      }) as any;

      store.replaceReducer(reducer);
    },
    useModel(model: Slice) {
      this.useSlice(model);
    },
  };
};
