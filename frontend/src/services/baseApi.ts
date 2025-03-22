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

// Create base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  endpoints: () => ({}),
  tagTypes: ['Auth', 'User', 'Notifications', 'Sessions'],
});