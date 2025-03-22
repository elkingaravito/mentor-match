import { configureStore } from '@reduxjs/toolkit';
import { api } from './services/api';
import notificationReducer from './store/slices/notificationSlice';
import messageReducer from './store/slices/messageSlice';
import sessionReducer from './store/slices/sessionSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    notification: notificationReducer,
    message: messageReducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
