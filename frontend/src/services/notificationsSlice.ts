import { baseApi } from './baseApi';
import type { Notification } from '@/types/api';

// Extend the base API with notifications endpoints
export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => 'notifications',
      providesTags: ['Notifications'],
    }),
  }),
});

// Export the hooks
export const { useGetNotificationsQuery } = notificationsApi;
