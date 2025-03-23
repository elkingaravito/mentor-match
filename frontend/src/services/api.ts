import { baseApi } from './baseApi';
import type { Notification } from '@/types/api';

// Define response type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Extend the base API
export const api = baseApi.injectEndpoints({
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
export const { useGetNotificationsQuery } = api;
