import { configureStore } from '@reduxjs/toolkit';
import { notificationsApi } from '../services/notificationsSlice';

const store = configureStore({
  reducer: {
    [notificationsApi.reducerPath]: notificationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(notificationsApi.middleware),
});

export { store };
