import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './slices/notificationSlice';
import messageReducer from './slices/messageSlice';
import sessionReducer from './slices/sessionSlice';
import { apiSlice } from '../services/api';

export const store = configureStore({
  reducer: {
    notifications: notificationReducer,
    messages: messageReducer,
    sessions: sessionReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;