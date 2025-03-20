import { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { FetchBaseQueryError, FetchArgs, fetchBaseQuery } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { ApiError } from '../types/api';

// Create a mutex to prevent multiple token refresh calls
const mutex = new Mutex();

interface RefreshResult {
    data: {
        token: string;
    };
}

export const retry = (
    baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
    config: {
        maxRetries: number;
        backoff?: 'exponential' | 'linear';
        statusCodes?: number[];
    } = { maxRetries: 3 }
) => {
    return async (args: string | FetchArgs, api: any, extraOptions: any) => {
        let result = await baseQuery(args, api, extraOptions);
        let retryCount = 0;

        const shouldRetry = (error: FetchBaseQueryError) => {
            const status = 'status' in error ? error.status : null;
            return (
                retryCount < config.maxRetries &&
                (!config.statusCodes || (status && config.statusCodes.includes(Number(status))))
            );
        };

        const getDelay = () => {
            const baseDelay = 1000;
            if (config.backoff === 'exponential') {
                return baseDelay * Math.pow(2, retryCount);
            }
            return baseDelay * (retryCount + 1);
        };

        while (shouldRetry(result.error as FetchBaseQueryError)) {
            retryCount++;
            const delay = getDelay();
            console.log(`Retrying request (${retryCount}/${config.maxRetries}) after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
            result = await baseQuery(args, api, extraOptions);
        }

        return result;
    };
};

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    // Create base query
    const baseQuery = fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    });

    // Wait until the mutex is available without locking it
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && 'status' in result.error) {
        // Check if error is 401
        if (result.error.status === 401) {
            // Check if mutex is locked
            if (!mutex.isLocked()) {
                const release = await mutex.acquire();
                try {
                    // Try to get a new token
                    const refreshResult = await baseQuery(
                        { url: '/auth/refresh', method: 'POST' },
                        api,
                        extraOptions
                    ) as RefreshResult;

                    if (refreshResult.data) {
                        // Store the new token
                        localStorage.setItem('token', refreshResult.data.token);
                        // Retry the initial query
                        result = await baseQuery(args, api, extraOptions);
                    } else {
                        // Refresh failed - logout
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }
                } finally {
                    // Release mutex
                    release();
                }
            } else {
                // Wait for mutex to be released and try again
                await mutex.waitForUnlock();
                result = await baseQuery(args, api, extraOptions);
            }
        }
    }

    return result;
};

export const createApiError = (error: unknown): ApiError => {
    if (error instanceof Error) {
        return {
            message: error.message,
            code: 'UNKNOWN_ERROR',
            status: 500
        };
    }
    return {
        message: 'An unknown error occurred',
        code: 'UNKNOWN_ERROR',
        status: 500
    };
};