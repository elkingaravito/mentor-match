// /Users/apple/Workspace/mentor-match/frontend/src/services/api.ts

import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { 
    User, Mentor, Mentee, Session, Statistics, 
    Notification, Match, ApiResponse, ApiError,
    GlobalStatistics, UserStatistics, TrendStatistics
} from '../types';
import { API_BASE_URL, API_ENDPOINTS } from '../config';
import { retry } from '../utils/api';
import { createCustomError } from '../utils/error';

// API Configuration
const API_CONFIG = {
    baseUrl: API_BASE_URL,
    retryConfig: {
        maxRetries: 3,
        backoff: 'exponential',
        statusCodes: [408, 429, 500, 502, 503, 504]
    }
};

// Base query with token handling
const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.baseUrl,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    }
});

// Enhanced query with retry logic and error handling
const enhancedBaseQuery = retry(baseQuery, API_CONFIG.retryConfig);

// API definition with type-safe endpoints
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: enhancedBaseQuery,
    tagTypes: ['User', 'Session', 'Notification', 'Match', 'Statistics'],
    endpoints: (builder) => ({
        // Auth endpoints
        login: builder.mutation<ApiResponse<{ token: string; user: User }>, { email: string; password: string }>({
            query: (credentials) => ({
                url: API_ENDPOINTS.auth.login,
                method: 'POST',
                body: credentials,
            }),
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
        }),
        register: builder.mutation<ApiResponse<{ token: string; user: User }>, any>({
            query: (userData) => ({
                url: API_ENDPOINTS.auth.register,
                method: 'POST',
                body: userData,
            }),
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
        }),

        // User endpoints
        getUser: builder.query<ApiResponse<User>, void>({
            query: () => API_ENDPOINTS.users.profile,
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['User'],
        }),
        getMentors: builder.query<ApiResponse<Mentor[]>, void>({
            query: () => API_ENDPOINTS.users.mentors,
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['User'],
        }),
        getMentees: builder.query<ApiResponse<Mentee[]>, void>({
            query: () => API_ENDPOINTS.users.mentees,
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['User'],
        }),

        // Profile endpoints
        createMentorProfile: builder.mutation<ApiResponse<Mentor>, any>({
            query: (profile) => ({
                url: API_ENDPOINTS.users.mentorProfile,
                method: 'POST',
                body: profile,
            }),
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            invalidatesTags: ['User'],
        }),
        createMenteeProfile: builder.mutation<ApiResponse<Mentee>, any>({
            query: (profile) => ({
                url: API_ENDPOINTS.users.menteeProfile,
                method: 'POST',
                body: profile,
            }),
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            invalidatesTags: ['User'],
        }),
        updateProfile: builder.mutation<ApiResponse<User>, any>({
            query: (profile) => ({
                url: API_ENDPOINTS.users.profile,
                method: 'PUT',
                body: profile,
            }),
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            invalidatesTags: ['User'],
        }),

        // Statistics endpoints
        getUserStatistics: builder.query<ApiResponse<UserStatistics>, void>({
            query: () => API_ENDPOINTS.statistics.user,
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['Statistics'],
        }),
        getGlobalStatistics: builder.query<ApiResponse<GlobalStatistics>, void>({
            query: () => API_ENDPOINTS.statistics.global,
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['Statistics'],
        }),
        getTopMentors: builder.query<ApiResponse<Mentor[]>, void>({
            query: () => API_ENDPOINTS.statistics.topMentors,
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['Statistics'],
        }),
        getPopularSkills: builder.query<ApiResponse<{ skill: string; count: number }[]>, void>({
            query: () => API_ENDPOINTS.statistics.popularSkills,
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['Statistics'],
        }),
        getSessionTrends: builder.query<ApiResponse<TrendStatistics>, { days?: number }>({
            query: ({ days = 30 }) => ({
                url: API_ENDPOINTS.statistics.sessionTrends,
                params: { days },
            }),
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['Statistics'],
        }),

        // Session endpoints
        getSessions: builder.query<ApiResponse<Session[]>, void>({
            query: () => API_ENDPOINTS.sessions.base,
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['Session'],
        }),
        getSession: builder.query<ApiResponse<Session>, number>({
            query: (id) => API_ENDPOINTS.sessions.byId(id),
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['Session'],
        }),

        // Notification endpoints
        getNotifications: builder.query<ApiResponse<Notification[]>, void>({
            query: () => API_ENDPOINTS.notifications.base,
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['Notification'],
        }),
        markNotificationRead: builder.mutation<ApiResponse<void>, number>({
            query: (id) => ({
                url: `${API_ENDPOINTS.notifications.base}/${id}/read`,
                method: 'PUT'
            }),
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            invalidatesTags: ['Notification'],
        }),
        markAllNotificationsRead: builder.mutation<ApiResponse<void>, void>({
            query: () => ({
                url: `${API_ENDPOINTS.notifications.base}/read-all`,
                method: 'PUT'
            }),
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            invalidatesTags: ['Notification'],
        }),
        deleteNotification: builder.mutation<ApiResponse<void>, number>({
            query: (id) => ({
                url: `${API_ENDPOINTS.notifications.base}/${id}`,
                method: 'DELETE'
            }),
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            invalidatesTags: ['Notification'],
        }),

        // Matching endpoints
        getMenteeMatches: builder.query<ApiResponse<Match[]>, void>({
            query: () => API_ENDPOINTS.matching.menteeMatches,
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['Match'],
        }),
        getMentorMatches: builder.query<ApiResponse<Match[]>, void>({
            query: () => API_ENDPOINTS.matching.mentorMatches,
            transformErrorResponse: (response: FetchBaseQueryError) => createCustomError(response),
            providesTags: ['Match'],
        }),
    }),
});

// Export hooks
export const {
    // Auth
    useLoginMutation,
    useRegisterMutation,
    // User
    useGetUserQuery,
    useGetMentorsQuery,
    useGetMenteesQuery,
    // Profile
    useCreateMentorProfileMutation,
    useCreateMenteeProfileMutation,
    useUpdateProfileMutation,
    // Statistics
    useGetUserStatisticsQuery,
    useGetGlobalStatisticsQuery,
    useGetTopMentorsQuery,
    useGetPopularSkillsQuery,
    useGetSessionTrendsQuery,
    // Sessions
    useGetSessionsQuery,
    useGetSessionQuery,
    // Notifications
    useGetNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
    useDeleteNotificationMutation,
    // Matching
    useGetMenteeMatchesQuery,
    useGetMentorMatchesQuery,
} = apiSlice;
