import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupApiStore } from '../../utils/test-utils';
import { apiSlice } from '../api';
import { ApiResponse, UserStatistics, GlobalStatistics, TrendStatistics } from '../../types';

const mockUserStats: ApiResponse<UserStatistics> = {
    data: {
        user_id: 1,
        name: "Test User",
        role: "mentor",
        sessions: {
            total: 10,
            completed: 8,
            cancelled: 1,
            upcoming: 1
        },
        mentoring_hours: 16.5,
        average_rating: 4.5
    },
    status: 200
};

const mockGlobalStats: ApiResponse<GlobalStatistics> = {
    data: {
        users: {
            total: 100,
            mentors: 40,
            mentees: 60
        },
        sessions: {
            total: 150,
            completed: 120,
            cancelled: 20,
            completion_rate: 80
        },
        mentoring_hours: 300.5,
        average_rating: 4.2
    },
    status: 200
};

const mockTrendStats: ApiResponse<TrendStatistics> = {
    data: {
        by_day: [
            { day: "2024-02-28", count: 5 },
            { day: "2024-02-29", count: 3 }
        ],
        by_status: [
            { status: "completed", count: 120 },
            { status: "cancelled", count: 20 }
        ],
        by_hour: [
            { hour: 9, count: 15 },
            { hour: 10, count: 20 }
        ],
        completion_rate: 80
    },
    status: 200
};

describe('API Service', () => {
    const storeRef = setupApiStore(apiSlice);
    
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    describe('Statistics Endpoints', () => {
        it('should fetch user statistics successfully', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockUserStats));

            const { result } = renderHook(
                () => apiSlice.endpoints.getUserStatistics.useQuery(),
                {
                    wrapper: ({ children }) => (
                        <Provider store={storeRef.store}>{children}</Provider>
                    ),
                }
            );

            await waitFor(() => {
                expect(result.current.data).toEqual(mockUserStats);
            });

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/statistics/user/current'),
                expect.any(Object)
            );
        });

        it('should fetch global statistics successfully', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockGlobalStats));

            const { result } = renderHook(
                () => apiSlice.endpoints.getGlobalStatistics.useQuery(),
                {
                    wrapper: ({ children }) => (
                        <Provider store={storeRef.store}>{children}</Provider>
                    ),
                }
            );

            await waitFor(() => {
                expect(result.current.data).toEqual(mockGlobalStats);
            });
        });

        it('should fetch session trends successfully', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockTrendStats));

            const { result } = renderHook(
                () => apiSlice.endpoints.getSessionTrends.useQuery({ days: 30 }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={storeRef.store}>{children}</Provider>
                    ),
                }
            );

            await waitFor(() => {
                expect(result.current.data).toEqual(mockTrendStats);
            });
        });

        it('should handle API errors correctly', async () => {
            const errorResponse = {
                status: 500,
                message: 'Internal Server Error'
            };
            fetchMock.mockRejectOnce(new Error('API Error'));

            const { result } = renderHook(
                () => apiSlice.endpoints.getUserStatistics.useQuery(),
                {
                    wrapper: ({ children }) => (
                        <Provider store={storeRef.store}>{children}</Provider>
                    ),
                }
            );

            await waitFor(() => {
                expect(result.current.error).toBeDefined();
                expect(result.current.isError).toBe(true);
            });
        });
    });
});