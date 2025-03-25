import { configureStore, ConfigureStoreOptions } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import notificationReducer from './slices/notificationSlice';
import messageReducer from './slices/messageSlice';
import sessionReducer from './slices/sessionSlice';
import { baseApi } from '../services/baseApi';

const createStore = (options?: ConfigureStoreOptions['preloadedState'] | undefined) => {
  const store = configureStore({
    reducer: {
      notifications: notificationReducer,
      messages: messageReducer,
      sessions: sessionReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }).concat(baseApi.middleware),
    devTools: {
      name: 'Mentor Match',
      trace: import.meta.env.DEV,
      traceLimit: 25,
    },
    ...options,
  });

  // Log initial state in development
  if (import.meta.env.DEV) {
    console.log('Initial Redux State:', store.getState());
  }

  // Enable listener behavior for the store
  setupListeners(store.dispatch);

  // Add state change subscription in development
  if (import.meta.env.DEV) {
    store.subscribe(() => {
      const state = store.getState();
      console.log('Redux State Updated:', {
        api: state[baseApi.reducerPath],
        notifications: state.notifications,
        messages: state.messages,
        sessions: state.sessions,
      });
    });
  }

  return store;
};

export const store = createStore();

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store creator (useful for testing)
export default createStore;
