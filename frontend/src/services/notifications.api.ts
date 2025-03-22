import { api } from './api';
import type { Notification } from '@/types/api';

interface NotificationsResponse {
  data: Notification[];
  success: boolean;
  message: string;
}

// Inject the notifications endpoints into the API
export const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => 'notifications',
      transformResponse: (response: NotificationsResponse) => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      },
      providesTags: ['Notifications'],
    }),
  }),
});

// Export the hooks
export const { useGetNotificationsQuery } = extendedApi.endpoints.getNotifications;
