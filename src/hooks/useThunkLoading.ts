import { isAsyncThunkAction, AsyncThunk } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { DEFAULT_LOADING_NAME } from '../constant/plugin';

export const createUseThunkLoading = (name: string = DEFAULT_LOADING_NAME) => {
  const useLoading = (action: AsyncThunk<any, any, any>) => {
    if (!isAsyncThunkAction(action)) {
      throw new TypeError('useLoading parameter "action" must be ActionsFromAsyncThunk');
    }
    return useSelector((state: any) => {
      const loadingMap = state[name] && state[name].loading;
      return loadingMap ? !!loadingMap[action.typePrefix] : false;
    });
  };

  return useLoading;
};

export const useThunkLoading = createUseThunkLoading();
