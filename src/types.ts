import {
  Action,
  AnyAction,
  AsyncThunkPayloadCreator,
  createSlice,
  Dispatch,
  EnhancedStore,
  Slice,
  Reducer,
  ReducersMapObject,
  Middleware,
  StoreEnhancer,
} from '@reduxjs/toolkit';
import { BaseThunkAPI as ToolkitBaseThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';

import { createModel } from './model';

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
  createModel: typeof createModel;
  createSlice: typeof createSlice;
  addReducer(name: string, reducer: Reducer): ReduxApp<S, A, M>;
  removeReducer(name: string): ReduxApp<S, A, M>;
  injectSlice(slice: Slice): ReduxApp<S, A, M>;
  injectModel(model: Slice): ReduxApp<S, A, M>;
};

export type BaseThunkAPI<
  State = unknown,
  RejectedValue = unknown,
  RejectedMeta = unknown,
  FulfilledMeta = unknown,
  Extra = unknown,
  D extends Dispatch = Dispatch,
> = ToolkitBaseThunkAPI<State, Extra, D, RejectedValue, RejectedMeta, FulfilledMeta>;
