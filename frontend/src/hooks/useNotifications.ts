import { useGetNotificationsQuery } from '../services/api';
import type { Notification } from '@/types/api';

export const useNotifications = (options?: { skip?: boolean }) => {
  const result = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
    ...options,
  });

  return {
    notifications: result.data || [] as Notification[],
    error: result.error,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    unreadCount: result.data?.filter(n => !n.read).length || 0,
  };
};
