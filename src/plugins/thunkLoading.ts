import {
  isAsyncThunkAction,
  isPending,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { Plugin } from '../types';
import { DEFAULT_LOADING_NAME } from '../constant/plugin';

interface ThunkLoadingOptions {
  name?: string;
}

export const createThunkLoadingPlugin = (
  options?: ThunkLoadingOptions
): Plugin<any, PayloadAction<{ type: string; status: boolean }>> => {
  const { name = DEFAULT_LOADING_NAME } = options || {};

  const { actions, reducer } = createSlice({
    name,
    initialState: {} as Record<string, boolean>,
    reducers: {
      setLoading(
        state,
        { payload }: PayloadAction<{ type: string; status: boolean }>
      ) {
        state[payload.type] = payload.status;
      },
    },
  });

  return {
    reducer: {
      [name]: reducer,
    },
    middleware: ({ dispatch }) => next => action => {
      if (isAsyncThunkAction(action)) {
        const { type } = action as { type: string };

        dispatch({
          type: actions.setLoading.type,
          payload: {
            type: type.slice(0, type.lastIndexOf('/')),
            status: isPending(action),
          },
        });
      }

      return next(action);
    },
  };
};

export const thunkLoadingPlugin = createThunkLoadingPlugin();
