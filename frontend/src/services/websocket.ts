import { api } from './api';
import { io } from 'socket.io-client';
import { WS_BASE_URL, WS_CONFIG } from '../config';

// Create the socket instance
const socket = io(WS_BASE_URL, WS_CONFIG);

// Extend the base api
export const wsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    connect: builder.mutation({
      queryFn: async (token: string) => {
        try {
          socket.auth = { token };
          await socket.connect();
          return { data: true };
        } catch (error) {
          return { error };
        }
      }
    }),
    disconnect: builder.mutation({
      queryFn: () => {
        socket.disconnect();
        return { data: true };
      }
    }),
    subscribe: builder.query({
      queryFn: () => ({ data: null }),
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded;

          socket.on('message', (data) => {
            updateCachedData((draft) => {
              return { ...draft, lastMessage: data };
            });
          });

          await cacheEntryRemoved;
          socket.off('message');
        } catch {
          // Handle errors
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useConnectMutation,
  useDisconnectMutation,
  useSubscribeQuery,
} = wsApi;

// Export socket instance for direct usage if needed
export const wsService = socket;
