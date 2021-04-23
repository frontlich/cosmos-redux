import { AsyncThunk, AsyncThunkAction } from '@reduxjs/toolkit';
import { useMemo } from 'react';
import { ActionCreatorsMapObject, bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';

import { FunctionParam } from '../types';

type ReturnThunk<T extends AsyncThunk<any, any, any>> = T extends (
  ...arg: any
) => AsyncThunkAction<infer R, infer A, infer C>
  ? AsyncThunkAction<R, A, C>
  : T;

type AsyncAction<T> = T extends AsyncThunk<any, any, any>
  ? T extends () => any
    ? () => ReturnType<ReturnThunk<T>>
    : (p: FunctionParam<T>) => ReturnType<ReturnThunk<T>>
  : T;

type BindedCreators<T extends ActionCreatorsMapObject> = {
  [K in keyof T]: AsyncAction<T[K]>;
};

export const useActions = <T extends ActionCreatorsMapObject>(actions: T): BindedCreators<T> => {
  const dispatch = useDispatch();
  return useMemo(() => {
    return bindActionCreators<T, BindedCreators<T>>(actions, dispatch);
  }, [actions, dispatch]);
};
