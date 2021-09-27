# Cosmos Redux

[![npm version](https://img.shields.io/npm/v/cosmos-redux.svg)](https://www.npmjs.com/package/cosmos-redux)
[![npm downloads](https://img.shields.io/npm/dm/cosmos-redux.svg)](https://www.npmjs.com/package/cosmos-redux)

**对redux toolkit的再次封装**

## Installation

cosmos-redux is available as a package on NPM for use with a module bundler or in a Node application:

```bash
# NPM
npm install cosmos-redux --save

# Yarn
yarn add cosmos-redux
```

## usage

### 创建redux应用

```ts
// utils/redux.ts
import { configReduxApp } from 'cosmos-redux';

/**
 * 此处同 @reduxjs/toolkit 的 configureStore 的 options
 * 唯一不同点在于 reducer 属性只能是 ReducersMapObject 类型
 */
const options = {};

export const app = configReduxApp(options).complete();

export const store = app.getStore();
```

```tsx
// app.tsx
import { Provider } from 'cosmos-redux';
import { store } from 'utils/redux';

// render
<Provider store={store}>
  <App />
</Provider>
```

### 使用插件

```ts
// utils/redux.ts
import { configReduxApp, thunkLoadingPlugin } from 'cosmos-redux';

/**
 * 此处同 @reduxjs/toolkit 的 configureStore 的 options
 * 唯一不同点在于 reducer 属性只能是 ReducersMapObject 类型
 */
const options = {};

export const app = configReduxApp(options);

app.addPlugin(thunkLoadingPlugin).complete();
```

### 创建model

 创建 `model` 时，参数同 `@reduxjs/toolkit` 的 `createSlice`
 
 区别在于
 * 1、增加了两个参数，`thunks` 和 `thunksBuilder`
 * 2、`extraReducers` 只能使用函数方式
 
 thunks 是一个 ThunkCreatorMap 对象，传入后会自动调用 `createAsyncThunk` 为每一个 key 创建一个对应的 `AsyncThunk`，得到一个 AsyncThunkMap 对象
 
 thunksBuilder 是一个函数，作用同 `extraReducers`，区别在于能从参数中能获取到创建好的 AsyncThunkMap 对象
 
 model 是一个对象，其扩展了 `createSlice` 方法创建的对象，增加了 thunks 和 selectors 两个属性，thunks 为 AsyncThunkMap 对象，selectors 为属性的选择函数的映射，用于使用 `useSelector` 选择属性。

```ts
// model.ts
import { app } from 'utils/redux';

const model = app.createModel({
  name: 'todo',
  initialState: {
    todoList: []
  },
  reducers: {},
  thunks: {
    getTodoList: async () => {
      const list = await fetch('/api/todoList');
      return list;
    }
  },
  thunksBuilder: (thunks, builder) => {
    builder.addCase(thunks.getTodoList.fulfilled, (state, { payload }) => {
      state.todoList = payload;
    })
  }
});

export const { actions, thunks, selectors } = model;
```

### 使用 model

* useActions

`useActions` 会对传入进来的 ActionCreatorMap 对象调用 redux 中的 `bindActionCreators` 方法，自动绑定 `dispath`，得到调用 `dispatch` 的函数Map。

* useThunkLoading

在添加了 `thunkLoadingPlugin` 插件后，`useThunkLoading` 会自动根据传入的 thunkCreator 获取到当前的 pending 状态。

* selectors

selectors 是一个选择属性的函数的集合

```tsx
import React, { useEffect } from 'react';
import { useActions, useThunkLoading, useSelector } from 'cosmos-redux';
import { Table } from 'antd';

import { actions, thunks, selectors } from './model';

const TodoList = () => {
  const actions = useActions(actions, thunks);
  const loading = useThunkLoading(thunks.getTodoList);
  const todoList = useSelector(selectors.todoList);

  useEffect(() => {
    actions.getTodoList();
  }, []);

  return <Table loading={loading} dataSource={todoList} />
}
```


## Documentation