import { api } from './api';
import type {
    Session,
    SessionCreate,
    SessionUpdate,
    SessionFilters,
    SessionStats,
    ApiResponse
} from '../types/api';
import type { SessionWithParticipants } from '../types/store';

// Extend the base api with session endpoints
export const sessionApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Queries
        getSessions: builder.query<ApiResponse<SessionWithParticipants[]>, SessionFilters | void>({
            query: (filters) => {
                const params = new URLSearchParams();
                if (filters?.startDate) {
                    params.append("start_date", filters.startDate.toISOString());
                }
                if (filters?.endDate) {
                    params.append("end_date", filters.endDate.toISOString());
                }
                if (filters?.status?.length) {
                    filters.status.forEach(status => 
                        params.append("status", status)
                    );
                }
                if (filters?.participantId) {
                    params.append("participant_id", filters.participantId.toString());
                }
                return {
                    url: `/sessions${params.toString() ? `?${params.toString()}` : ''}`,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'Session' as const, id })),
                        { type: 'Session', id: 'LIST' },
                    ]
                    : [{ type: 'Session', id: 'LIST' }],
        }),

        getSessionStats: builder.query<ApiResponse<SessionStats>, void>({
            query: () => '/sessions/stats',
            providesTags: ['SessionStats'],
        }),

        // Mutations
        createSession: builder.mutation<ApiResponse<Session>, SessionCreate>({
            query: (session) => ({
                url: '/sessions',
                method: 'POST',
                body: session,
            }),
            invalidatesTags: [{ type: 'Session', id: 'LIST' }, 'SessionStats'],
        }),

        updateSession: builder.mutation<ApiResponse<Session>, { id: number; update: SessionUpdate }>({
            query: ({ id, update }) => ({
                url: `/sessions/${id}`,
                method: 'PUT',
                body: update,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Session', id },
                'SessionStats',
            ],
        }),

        deleteSession: builder.mutation<void, number>({
            query: (id) => ({
                url: `/sessions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Session', id },
                { type: 'Session', id: 'LIST' },
                'SessionStats',
            ],
        }),

        rescheduleSession: builder.mutation<
            ApiResponse<Session>,
            { id: number; startTime: string; endTime: string }
        >({
            query: ({ id, startTime, endTime }) => ({
                url: `/sessions/${id}/reschedule`,
                method: 'POST',
                body: { start_time: startTime, end_time: endTime },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Session', id }],
        }),

        completeSession: builder.mutation<
            ApiResponse<Session>,
            { id: number; feedback?: string }
        >({
            query: ({ id, feedback }) => ({
                url: `/sessions/${id}/complete`,
                method: 'POST',
                body: { feedback },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Session', id },
                'SessionStats',
            ],
        }),

        cancelSession: builder.mutation<
            ApiResponse<Session>,
            { id: number; reason?: string }
        >({
            query: ({ id, reason }) => ({
                url: `/sessions/${id}/cancel`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Session', id },
                'SessionStats',
            ],
        }),
    }),
});

// Queries
getSessionById: builder.query<ApiResponse<SessionWithParticipants>, number>({
    query: (id) => `sessions/${id}`,
    providesTags: (result, error, id) => [{ type: 'Session', id }],
}),

// Export hooks for usage in components
export const {
    useGetSessionsQuery,
    useGetSessionByIdQuery,
    useGetSessionStatsQuery,
    useCreateSessionMutation,
    useUpdateSessionMutation,
    useDeleteSessionMutation,
    useRescheduleSessionMutation,
    useCompleteSessionMutation,
    useCancelSessionMutation,
} = sessionApi;

// Export the enhanced API for use in other services
export const enhancedApi = sessionApi.enhanceEndpoints({
    addTagTypes: ['Session', 'SessionStats'],
    endpoints: {
        getSessions: {
            providesTags: ['Session'],
        },
        getSessionStats: {
            providesTags: ['SessionStats'],
        },
    },
});
