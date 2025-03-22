import { baseApi } from '../baseApi';
import { ApiResponse, Notification } from '@/types/api';

// Define transformResponse function
const transformNotificationsResponse = (response: ApiResponse<Notification[]>) => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => '/notifications',
      transformResponse: transformNotificationsResponse,
      providesTags: (result = []) => [
        'Notifications',
        ...result.map(({ id }) => ({ type: 'Notifications' as const, id })),
      ],
      // Add error handling
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      },
    }),
    markNotificationAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const notification = draft.find((n) => n.id === id);
            if (notification) {
              notification.read = true;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_, __, id) => [{ type: 'Notifications', id }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} = notificationApi;
