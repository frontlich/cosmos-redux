import { AsyncThunk, AsyncThunkPayloadCreator, createAsyncThunk } from '@reduxjs/toolkit';
import { FunctionParam, PromiseValue } from './types';

export type ThunkCreator<S = any, R = any> = AsyncThunkPayloadCreator<R, unknown, { state: S }>;

export type ThunksActions<T extends Record<string, ThunkCreator>> = {
  [K in keyof T]: AsyncThunk<PromiseValue<ReturnType<T[K]>>, FunctionParam<T[K]>, { state: any }>;
};

export const getCreateThunks = <S>(name: string) => {
  return <T extends Record<string, ThunkCreator<S>>>(thunks: T): ThunksActions<T> => {
    const thunksMap: any = {};

    Object.entries(thunks).forEach(([key, payloadCreator]) => {
      const type = `${name}/${key}`;
      const thunkCreator = createAsyncThunk(type, payloadCreator);

      thunksMap[key] = thunkCreator;
    });

    return thunksMap;
  };
};

export const createThunks = <T extends Record<string, ThunkCreator>>(
  name: string,
  thunks: T,
): ThunksActions<T> => {
  return getCreateThunks(name)(thunks);
};
