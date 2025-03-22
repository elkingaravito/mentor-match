import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Notification } from '@/types/api';

// Define response type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Create the API instance
export const api = createApi({
  reducerPath: 'api',
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

// Export hooks
export const { useGetNotificationsQuery } = api.endpoints.getNotifications;
