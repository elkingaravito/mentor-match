import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Notification } from '@/types/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const notificationsApi = createApi({
  reducerPath: 'notifications',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => 'notifications',
      transformResponse: (response: ApiResponse<Notification[]>) => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      },
    }),
  }),
});

export const { useGetNotificationsQuery } = notificationsApi;