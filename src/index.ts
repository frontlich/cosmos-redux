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
  PayloadAction,
} from '@reduxjs/toolkit';

import { createModel } from './model';
import plugin from './plugin';
import { FunctionParam, Middlewares, ReduxApp } from './types';

export { PayloadAction };
export { useSelector } from 'react-redux';

export * from './plugins';
export * from './hooks';
export * from './thunks';
export * from './selectors';
export * from './model';
export * from './types';

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

      if (asyncReducers[name] || initialReducers[name]) {
        // 防止重复注入
        return this;
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
