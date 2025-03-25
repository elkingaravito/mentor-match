import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './services/api';
import authReducer from './features/auth/authSlice';
import uiReducer from './features/ui/uiSlice';
// Importa otros reducers según sea necesario

export const store = configureStore({
  reducer: {
    // Añade el reducer de API generado por RTK Query
    [api.reducerPath]: api.reducer,
    // Otros reducers de tu aplicación
    auth: authReducer,
    ui: uiReducer,
    // ... otros reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware),
  devTools: import.meta.env.DEV,
});

// Opcional, pero requerido para refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Inferencia de tipo para el estado de la tienda
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;