import { useState, useCallback } from 'react';

interface UseLoadingOptions {
  initialState?: boolean;
  timeout?: number;
  onTimeout?: () => void;
}

export const useLoading = (options: UseLoadingOptions = {}) => {
  const {
    initialState = false,
    timeout = 30000,
    onTimeout,
  } = options;

  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<Error | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);

    if (timeout > 0) {
      const id = setTimeout(() => {
        setIsLoading(false);
        setError(new Error('Operation timed out'));
        onTimeout?.();
      }, timeout);
      setTimeoutId(id);
    }
  }, [timeout, onTimeout]);

  const stopLoading = useCallback((error?: Error) => {
    setIsLoading(false);
    if (error) {
      setError(error);
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  const withLoading = useCallback(async <T>(
    promise: Promise<T>,
    options: {
      successMessage?: string;
      errorMessage?: string;
    } = {}
  ): Promise<T> => {
    try {
      startLoading();
      const result = await promise;
      stopLoading();
      return result;
    } catch (error) {
      stopLoading(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    withLoading,
  };
};