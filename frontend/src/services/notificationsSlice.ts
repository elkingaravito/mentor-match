import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Notification } from '@/types/api';

// Define the notifications API
const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => 'notifications',
    }),
  }),
});

// Export the hook
export const { useGetNotificationsQuery } = notificationsApi;

// Export the API for the store
export { notificationsApi };