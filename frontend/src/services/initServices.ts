import { store } from '../store/store';
import { api } from './api';

export const initializeServices = () => {
  // Suscribirse a cambios en el estado de autenticación
  store.subscribe(() => {
    const state = store.getState();
    // Aquí puedes agregar lógica adicional si es necesario
  });

  // Pre-cargar endpoints importantes
  if (localStorage.getItem('token')) {
    store.dispatch(api.endpoints.getUser.initiate());
  }
};