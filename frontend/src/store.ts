import { configureStore } from '@reduxjs/toolkit';
import { wsApi } from './services/websocket';

export const store = configureStore({
  reducer: {
    [wsApi.reducerPath]: wsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(wsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;