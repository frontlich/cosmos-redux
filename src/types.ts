import { AsyncThunkPayloadCreator } from '@reduxjs/toolkit';
import { Middleware, ReducersMapObject, StoreEnhancer } from 'redux';

export type Interceptor = (next: AsyncThunkPayloadCreator<any>) => AsyncThunkPayloadCreator<any>;

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
