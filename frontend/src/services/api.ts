import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, Mentor, Mentee, Session, Statistics, Notification, Match } from '../types';

// Define la base query con la configuración del token
const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

// Crear la API
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery,
    tagTypes: ['User', 'Session', 'Notification', 'Match', 'Statistics'],
    endpoints: (builder) => ({
        // Auth endpoints
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
        }),

        // Profile endpoints
        createMentorProfile: builder.mutation({
            query: (profile) => ({
                url: '/users/mentor-profile',
                method: 'POST',
                body: profile,
            }),
            invalidatesTags: ['User'],
        }),
        createMenteeProfile: builder.mutation({
            query: (profile) => ({
                url: '/users/mentee-profile',
                method: 'POST',
                body: profile,
            }),
            invalidatesTags: ['User'],
        }),
        updateProfile: builder.mutation({
            query: (profile) => ({
                url: '/users/profile',
                method: 'PUT',
                body: profile,
            }),
            invalidatesTags: ['User'],
        }),

        // User queries
        getMentors: builder.query<Mentor[], void>({
            query: () => '/users/mentors',
            providesTags: ['User'],
        }),
        getMentees: builder.query<Mentee[], void>({
            query: () => '/users/mentees',
            providesTags: ['User'],
        }),

        // Session endpoints
        getSessions: builder.query<Session[], void>({
            query: () => '/sessions',
            providesTags: ['Session'],
        }),
        getSession: builder.query<Session, number>({
            query: (id) => `/sessions/${id}`,
            providesTags: ['Session'],
        }),

        // Notification endpoints
        getUserNotifications: builder.query<Notification[], void>({
            query: () => '/notifications',
            providesTags: ['Notification'],
        }),

        // Statistics endpoints
        getUserStatistics: builder.query<Statistics, void>({
            query: () => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                return `/statistics/user/${user.id}`;
            },
            providesTags: ['Statistics'],
        }),
        getGlobalStatistics: builder.query<Statistics, void>({
            query: () => '/statistics/global',
            providesTags: ['Statistics'],
        }),
        getTopMentors: builder.query<Mentor[], void>({
            query: () => '/statistics/top-mentors',
            providesTags: ['Statistics'],
        }),
        getPopularSkills: builder.query<any[], void>({
            query: () => '/statistics/popular-skills',
            providesTags: ['Statistics'],
        }),
        getSessionTrends: builder.query<any[], void>({
            query: () => '/statistics/session-trends',
            providesTags: ['Statistics'],
        }),

        // Matching endpoints
        getMenteeMatches: builder.query<Match[], void>({
            query: () => '/matching/mentee-matches',
            providesTags: ['Match'],
        }),
        getMentorMatches: builder.query<Match[], void>({
            query: () => '/matching/mentor-matches',
            providesTags: ['Match'],
        }),
    }),
});

// Export hooks
export const {
    useLoginMutation,
    useRegisterMutation,
    useCreateMentorProfileMutation,
    useCreateMenteeProfileMutation,
    useUpdateProfileMutation,
    useGetMentorsQuery,
    useGetMenteesQuery,
    useGetSessionsQuery,
    useGetSessionQuery,
    useGetUserNotificationsQuery,
    useGetUserStatisticsQuery,
    useGetGlobalStatisticsQuery,
    useGetTopMentorsQuery,
    useGetPopularSkillsQuery,
    useGetSessionTrendsQuery,
    useGetMenteeMatchesQuery,
    useGetMentorMatchesQuery,
} = apiSlice;
