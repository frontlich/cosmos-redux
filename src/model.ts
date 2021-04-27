import {
  ActionReducerMapBuilder,
  AsyncThunkPayloadCreator,
  createSlice,
  CreateSliceOptions,
  SliceCaseReducers,
} from '@reduxjs/toolkit';
import { createSelectors } from './selectors';
import { ThunksActions, getCreateThunks } from './thunks';
import { ReduxApp } from './types';

type NoInfer<T> = [T][T extends any ? 0 : never];

interface CreateModelOptions<
  S,
  CR extends SliceCaseReducers<S>,
  T extends Record<string, AsyncThunkPayloadCreator<any, any, { state: any }>>
> extends CreateSliceOptions<S, CR> {
  extraReducers?: (builder: ActionReducerMapBuilder<NoInfer<S>>) => void;
  thunks?: T;
  thunksBuilder?: (
    thunkActions: ThunksActions<T>,
    builder: ActionReducerMapBuilder<NoInfer<S>>
  ) => void;
}

export const createModel = <
  State,
  CaseReducer extends SliceCaseReducers<State>,
  Thunks extends Record<
    string,
    AsyncThunkPayloadCreator<any, any, { state: any }>
  >
>(
  options: CreateModelOptions<State, CaseReducer, Thunks>
) => {
  const {
    thunks: thunkCreators,
    thunksBuilder,
    extraReducers,
    ...sliceOptions
  } = options;

  const createThunks = getCreateThunks(options.name);
  const thunks = thunkCreators
    ? createThunks(thunkCreators)
    : ({} as ThunksActions<Thunks>);

  const slice = createSlice({
    ...sliceOptions,
    extraReducers: builder => {
      typeof extraReducers === 'function' && extraReducers(builder);
      typeof thunksBuilder === 'function' &&
        thunks &&
        thunksBuilder(thunks, builder);
    },
  });

  const selectors = createSelectors(slice.name, options.initialState);
  return { ...slice, thunks, selectors };
};

export const getCreateModelWidthApp = (app: ReduxApp): typeof createModel => {
  return options => {
    const model = createModel(options);
    app.injectSlice(model);
    return model;
  };
};
