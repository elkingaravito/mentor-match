import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../config/api';

// Create base query with retries
const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseUrl,
  credentials: 'include',
  timeout: API_CONFIG.timeout,
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Add retry logic
const baseQueryWithRetry = retry(baseQuery, { maxRetries: API_CONFIG.retries });

// Create custom base query with development handling
const customBaseQuery = async (args: any, api: any, extraOptions: any) => {
  // Log query details in development
  if (import.meta.env.DEV) {
    console.log('API Query:', { args, api, extraOptions });
  }

  // Handle mock data in development
  if (import.meta.env.DEV && args.mockData) {
    await new Promise(resolve => setTimeout(resolve, API_CONFIG.mockDelay));
    return { data: args.mockData };
  }

  try {
    const result = await baseQueryWithRetry(args, api, extraOptions);
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', result);
    }

    return result;
  } catch (error) {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error);
    }
    throw error;
  }
};

// Create base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery,
  endpoints: () => ({}),
  tagTypes: ['Auth', 'User', 'Notifications', 'Sessions', 'Messages', 'Matches'],
  keepUnusedDataFor: import.meta.env.DEV ? 0 : 60,
  refetchOnMountOrArgChange: import.meta.env.DEV ? false : 30,
  refetchOnFocus: import.meta.env.DEV ? false : true,
  refetchOnReconnect: import.meta.env.DEV ? false : true,
});
