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
): Plugin<{ name: string }> => {
  const { name = DEFAULT_LOADING_NAME } = options || {};

  const slice = createSlice({
    name,
    initialState: {
      loading: {} as Record<string, boolean>,
    },
    reducers: {
      setLoading(
        state,
        { payload }: PayloadAction<{ type: string; status: boolean }>
      ) {
        state.loading[payload.type] = payload.status;
      },
    },
  });

  return {
    name,
    reducer: {
      [name]: slice.reducer,
    },
    middleware: ({ dispatch }) => next => action => {
      if (isAsyncThunkAction(action)) {
        const { type } = action as { type: string };

        dispatch({
          type: slice.actions.setLoading.type,
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
