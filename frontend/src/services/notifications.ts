import { api } from './api';
import type { Notification } from '@/types/api';

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => 'notifications',
      transformResponse: (response: { data: Notification[] }) => response.data,
      providesTags: ['Notifications'],
    }),
  }),
});

export const { useGetNotificationsQuery } = notificationsApi;