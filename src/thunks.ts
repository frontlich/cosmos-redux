import {
  AsyncThunk,
  AsyncThunkOptions,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { FunctionParam, PromiseValue } from './types';

/**
 * @deprecated
 */
type ThunkCreatorWithOptionsOld<S, R> = [
  AsyncThunkPayloadCreator<R, any, { state: S }>,
  AsyncThunkOptions
];

type ThunkCreatorWithOptions<S = any, R = any> = {
  thunk: AsyncThunkPayloadCreator<R, any, { state: S }>;
  options?: AsyncThunkOptions;
};

export type ThunkCreator<S = any, R = any> =
  | AsyncThunkPayloadCreator<R, any, { state: S }>
  | ThunkCreatorWithOptionsOld<S, R>
  | ThunkCreatorWithOptions<S, R>;

type ReturnCreator<T extends ThunkCreator> = T extends {
  thunk: infer U;
  options?: AsyncThunkOptions;
}
  ? U
  : T extends [infer O, AsyncThunkOptions]
  ? O
  : T;

export type ThunksActions<T extends Record<string, ThunkCreator>> = {
  [K in keyof T]: AsyncThunk<
    PromiseValue<ReturnType<ReturnCreator<T[K]>>>,
    FunctionParam<ReturnCreator<T[K]>>,
    { state: any }
  >;
};

export const getCreateThunks = <S>(name: string) => {
  return <T extends Record<string, ThunkCreator<S>>>(
    thunks: T
  ): ThunksActions<T> => {
    const thunksMap: any = {};

    Object.entries(thunks).forEach(([key, payloadCreator]) => {
      const type = `${name}/${key}`;
      let thunkCreator;
      if (typeof payloadCreator === 'function') {
        thunkCreator = createAsyncThunk(type, payloadCreator);
      } else {
        if (Array.isArray(payloadCreator)) {
          const [creator, options] = payloadCreator;
          thunkCreator = createAsyncThunk(type, creator, options);
        } else {
          const { thunk, options } = payloadCreator;
          const asyncThunk = createAsyncThunk(type, thunk, options);
          thunkCreator = asyncThunk;
        }
      }
      thunksMap[key] = thunkCreator;
    });

    return thunksMap;
  };
};

export const createThunks = <T extends Record<string, ThunkCreator>>(
  name: string,
  thunks: T
): ThunksActions<T> => {
  return getCreateThunks(name)(thunks);
};