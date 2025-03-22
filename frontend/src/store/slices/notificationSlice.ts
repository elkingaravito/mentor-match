import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationState } from '../../types/store';
import { Notification, NotificationType } from '../../types/api';

interface NotificationWithMeta extends Notification {
  isRead: boolean;
  isDisplayed: boolean;
  expiresAt?: number;
}

interface NotificationState {
  notifications: NotificationWithMeta[];
  unreadCount: number;
  filters: {
    types: NotificationType[];
    showRead: boolean;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  settings: {
    soundEnabled: boolean;
    desktopEnabled: boolean;
    autoHideDelay: number;
  };
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  filters: {
    types: [],
    showRead: false,
  },
  settings: {
    soundEnabled: true,
    desktopEnabled: true,
    autoHideDelay: 5000, // 5 segundos
  },
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Gestión de notificaciones
    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification: NotificationWithMeta = {
        ...action.payload,
        isRead: false,
        isDisplayed: false,
        expiresAt: action.payload.expiresAt || Date.now() + state.settings.autoHideDelay,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    setDisplayed: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isDisplayed = true;
      }
    },

    // Gestión de filtros
    setFilters: (state, action: PayloadAction<Partial<NotificationState['filters']>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Gestión de configuración
    updateSettings: (state, action: PayloadAction<Partial<NotificationState['settings']>>) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },
    resetSettings: (state) => {
      state.settings = initialState.settings;
    },

    // Limpieza
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    clearExpiredNotifications: (state) => {
      const now = Date.now();
      const expired = state.notifications.filter(n => n.expiresAt && n.expiresAt < now);
      expired.forEach(n => {
        if (!n.isRead) state.unreadCount -= 1;
      });
      state.notifications = state.notifications.filter(n => !n.expiresAt || n.expiresAt >= now);
    },
  },
});

export const {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  setDisplayed,
  setFilters,
  clearFilters,
  updateSettings,
  resetSettings,
  clearNotifications,
  clearExpiredNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
