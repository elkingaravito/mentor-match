import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { Api, ApiEndpointQuery } from '@reduxjs/toolkit/query';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
    cleanup();
});

export function setupApiStore<
    A extends Api<any, any, any>,
    R extends Record<string, any> = Record<string, never>
>(api: A, extraReducers?: R) {
    const getStore = () =>
        configureStore({
            reducer: {
                [api.reducerPath]: api.reducer,
                ...extraReducers,
            },
            middleware: (gdm) =>
                gdm({ serializableCheck: false, immutableCheck: false }).concat(
                    api.middleware
                ),
        });

    const initialStore = getStore();
    const refObj = {
        api,
        store: initialStore,
        wrapper: undefined as any,
    };

    return refObj;
}

export const createTestQueryHook = <T>(
    useQuery: ApiEndpointQuery<any, any, any>,
    mockData: T
) => {
    return () => {
        const { data, error, isLoading } = useQuery();
        return {
            data: data || mockData,
            error,
            isLoading,
        };
    };
};