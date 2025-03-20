import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { ApiError } from '../types/api';

export const createCustomError = (error: FetchBaseQueryError): ApiError => {
    if ('status' in error) {
        // Error from the server
        const status = error.status;
        if (typeof error.data === 'object' && error.data !== null) {
            return {
                message: (error.data as any).message || 'An unknown error occurred',
                code: (error.data as any).code || 'UNKNOWN_ERROR',
                status: typeof status === 'number' ? status : 500,
                details: (error.data as any).details
            };
        }
        // Default error for unknown server errors
        return {
            message: 'An unknown server error occurred',
            code: 'SERVER_ERROR',
            status: typeof status === 'number' ? status : 500
        };
    }

    // Network or other errors
    return {
        message: error.error || 'A network error occurred',
        code: 'NETWORK_ERROR',
        status: 0
    };
};

export const isApiError = (error: unknown): error is ApiError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        'code' in error &&
        'status' in error
    );
};

export const getErrorMessage = (error: unknown): string => {
    if (isApiError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};

export const handleApiError = (error: unknown): never => {
    const message = getErrorMessage(error);
    console.error('API Error:', message);
    throw new Error(message);
};