import {
  AsyncThunk,
  AsyncThunkOptions,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { FunctionParam, PromiseValue } from './types';

export type ThunkCreator<S = any, R = any> =
  | AsyncThunkPayloadCreator<R, any, { state: S }>
  | [AsyncThunkPayloadCreator<R, any, { state: S }>, AsyncThunkOptions];

type ReturnCreator<T extends ThunkCreator> = T extends [infer U, AsyncThunkOptions] ? U : T;

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
        const [creator, options] = payloadCreator;
        thunkCreator = createAsyncThunk(type, creator, options);
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