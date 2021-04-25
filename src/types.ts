import {
  Action,
  AnyAction,
  AsyncThunkPayloadCreator,
  EnhancedStore,
  Slice,
} from '@reduxjs/toolkit';
import { Middleware, ReducersMapObject, StoreEnhancer } from 'redux';

export type Interceptor = (
  next: AsyncThunkPayloadCreator<any>
) => AsyncThunkPayloadCreator<any>;

export type PromiseValue<T> = T extends Promise<infer U> ? U : T;

export type FunctionParam<T> = T extends () => void
  ? void
  : T extends (arg: infer A, ...rest: any) => any
  ? A
  : unknown;

export type Plugin<Extra = unknown> = {
  reducer?: ReducersMapObject;
  middleware?: Middleware;
  preloadState?: any;
  enhancers?: StoreEnhancer;
} & Extra;

export type Middlewares<S> = ReadonlyArray<Middleware<{}, S>>;

export type ReduxApp<
  S = any,
  A extends Action = AnyAction,
  M extends Middlewares<S> = Middlewares<S>
> = {
  addPlugin(p: Plugin): ReduxApp<S, A, M>;
  complete(callback?: () => void): ReduxApp<S, A, M>;
  getStore(): EnhancedStore<S, A, M>;
  injectSlice(slice: Slice): ReduxApp<S, A, M>;
  injectModel(model: Slice): ReduxApp<S, A, M>;

  /** @deprecated please repleace this method with injectSlice */
  useSlice(slice: Slice): ReduxApp<S, A, M>;
  /** @deprecated please repleace this method with injectModel */
  useModel(model: Slice): ReduxApp<S, A, M>;
};
