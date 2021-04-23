import { isAsyncThunkAction, AsyncThunk } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { DEFAULT_LOADING_NAME } from '../constant/plugin';

export const createUseThunkLoading = (name: string = DEFAULT_LOADING_NAME) => {
  const useLoading = (action: AsyncThunk<any, any, any>) => {
    if (!isAsyncThunkAction(action)) {
      throw new TypeError('useLoading parameter "action" must be ActionsFromAsyncThunk');
    }
    return useSelector((state: any) => {
      return state[name] && state[name].loading[action.typePrefix];
    });
  };

  return useLoading;
};

export const useThunkLoading = createUseThunkLoading();
