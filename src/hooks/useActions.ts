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

const defaultActions = {};

export function useActions<T extends ActionCreatorsMapObject>(
  actions: T
): BindedCreators<T>;
export function useActions<
  T1 extends ActionCreatorsMapObject,
  T2 extends ActionCreatorsMapObject
>(actions1: T1, actions2: T2): BindedCreators<T1> & BindedCreators<T2>;
export function useActions<
  T1 extends ActionCreatorsMapObject,
  T2 extends ActionCreatorsMapObject,
  T3 extends ActionCreatorsMapObject,
>(actions1: T1, actions2: T2, actions3: T3): BindedCreators<T1> & BindedCreators<T2> & BindedCreators<T3>;
export function useActions(actions1 = defaultActions, actions2 = defaultActions, actions3 = defaultActions) {
  const dispatch = useDispatch();
  return useMemo(() => {
    return bindActionCreators(
      Object.assign({}, actions1, actions2),
      dispatch
    );
  }, [actions1, actions2, actions3, dispatch]);
}
