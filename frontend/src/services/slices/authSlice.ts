import { baseApi } from '../baseApi';
import { AuthResponse, LoginCredentials, ApiResponse, User } from '../../types/api';

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
    logout: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    getUser: builder.query<ApiResponse<User>, void>({
      queryFn: () => {
        // Return mock user in development
        if (import.meta.env.DEV) {
          return {
            data: {
              success: true,
              message: 'User retrieved successfully',
              data: {
                id: 'mock-user',
                email: 'mock@example.com',
                name: 'Mock User',
                role: 'mentee'
              }
            }
          };
        }
        return {
          url: '/auth/me',
          method: 'GET'
        };
      },
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetUserQuery,
} = authApi;
