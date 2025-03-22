import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { ApiError } from '../types/api';

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
} as const;

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const createCustomError = (error: FetchBaseQueryError): ApiError => {
  if ('status' in error) {
    const status = error.status;
    const data = error.data as any;

    // Handle specific HTTP status codes
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return {
          message: 'Your session has expired. Please log in again.',
          code: ERROR_CODES.AUTH_ERROR,
          status: HTTP_STATUS.UNAUTHORIZED,
        };
      case HTTP_STATUS.FORBIDDEN:
        return {
          message: 'You do not have permission to access this resource.',
          code: ERROR_CODES.AUTH_ERROR,
          status: HTTP_STATUS.FORBIDDEN,
        };
      case HTTP_STATUS.NOT_FOUND:
        return {
          message: 'The requested resource was not found.',
          code: ERROR_CODES.NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND,
        };
    }

    // Handle server response with error data
    if (typeof data === 'object' && data !== null) {
      return {
        message: data.message || 'An unknown error occurred',
        code: data.code || ERROR_CODES.UNKNOWN_ERROR,
        status: typeof status === 'number' ? status : HTTP_STATUS.INTERNAL_SERVER,
        details: data.details,
      };
    }

    // Default server error
    return {
      message: 'An unknown server error occurred',
      code: ERROR_CODES.SERVER_ERROR,
      status: typeof status === 'number' ? status : HTTP_STATUS.INTERNAL_SERVER,
    };
  }

  // Network or other errors
  return {
    message: error.error || 'A network error occurred',
    code: ERROR_CODES.NETWORK_ERROR,
    status: 0,
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
  console.error('API Error:', error);
  
  // Log additional error details if available
  if (isApiError(error)) {
    console.error('Error Code:', error.code);
    console.error('Status:', error.status);
    if (error.details) {
      console.error('Details:', error.details);
    }
  }
  
  throw new Error(message);
};

export const isNetworkError = (error: unknown): boolean => {
  return isApiError(error) && error.code === ERROR_CODES.NETWORK_ERROR;
};

export const isAuthError = (error: unknown): boolean => {
  return isApiError(error) && error.code === ERROR_CODES.AUTH_ERROR;
};
