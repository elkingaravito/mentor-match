import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Definir tipos
interface Mentor {
  id: number;
  name: string;
  position: string;
  company: string;
  bio: string;
  linkedin_url: string;
}

interface Mentee {
  id: number;
  name: string;
  current_position: string;
  goals: string;
  bio: string;
  linkedin_url: string;
}

interface Session {
  id: number;
  mentor_id: number;
  mentee_id: number;
  start_time: string;
  end_time: string;
  status: string;
  mentor_name?: string;
  duration?: number;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Mentor', 'Mentee', 'Skill', 'Session', 'Availability', 'Notification'],
  endpoints: (builder) => ({
    // Auth
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

    // Users
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Mentor Profile
    createMentorProfile: builder.mutation({
      query: ({ userId, ...profileData }) => ({
        url: `/users/${userId}/mentor`,
        method: 'POST',
        body: profileData,
      }),
      invalidatesTags: ['User', 'Mentor'],
    }),
    updateMentorProfile: builder.mutation({
      query: ({ userId, ...profileData }) => ({
        url: `/users/${userId}/mentor`,
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User', 'Mentor'],
    }),

    // Mentee Profile
    createMenteeProfile: builder.mutation({
      query: ({ userId, ...profileData }) => ({
        url: `/users/${userId}/mentee`,
        method: 'POST',
        body: profileData,
      }),
      invalidatesTags: ['User', 'Mentee'],
    }),
    updateMenteeProfile: builder.mutation({
      query: ({ userId, ...profileData }) => ({
        url: `/users/${userId}/mentee`,
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User', 'Mentee'],
    }),

    // Skills
    getSkills: builder.query({
      query: () => '/skills',
      providesTags: ['Skill'],
    }),
    addMentorSkill: builder.mutation({
      query: ({ mentorId, ...skillData }) => ({
        url: `/skills/mentor/${mentorId}`,
        method: 'POST',
        body: skillData,
      }),
      invalidatesTags: ['Skill', 'Mentor'],
    }),
    addMenteeInterest: builder.mutation({
      query: ({ menteeId, ...interestData }) => ({
        url: `/skills/mentee/${menteeId}`,
        method: 'POST',
        body: interestData,
      }),
      invalidatesTags: ['Skill', 'Mentee'],
    }),

    // Availability
    getUserAvailability: builder.query({
      query: (userId) => `/availability/user/${userId}`,
      providesTags: ['Availability'],
    }),
    addUserAvailability: builder.mutation({
      query: ({ userId, ...availabilityData }) => ({
        url: `/availability/user/${userId}`,
        method: 'POST',
        body: availabilityData,
      }),
      invalidatesTags: ['Availability'],
    }),
    updateAvailability: builder.mutation({
      query: ({ id, ...availabilityData }) => ({
        url: `/availability/${id}`,
        method: 'PUT',
        body: availabilityData,
      }),
      invalidatesTags: ['Availability'],
    }),
    deleteAvailability: builder.mutation({
      query: (id) => ({
        url: `/availability/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Availability'],
    }),

    // Sessions
    getSessions: builder.query<Session[], void>({
      query: () => '/sessions',
      providesTags: ['Session'],
    }),
    createSession: builder.mutation({
      query: (sessionData) => ({
        url: '/sessions',
        method: 'POST',
        body: sessionData,
      }),
      invalidatesTags: ['Session'],
    }),
    updateSession: builder.mutation({
      query: ({ id, ...sessionData }) => ({
        url: `/sessions/${id}`,
        method: 'PUT',
        body: sessionData,
      }),
      invalidatesTags: ['Session'],
    }),
    addSessionFeedback: builder.mutation({
      query: ({ sessionId, userId, ...feedbackData }) => ({
        url: `/sessions/${sessionId}/feedback`,
        method: 'POST',
        body: { ...feedbackData, user_id: userId },
      }),
      invalidatesTags: ['Session'],
    }),

    // Matchmaking
    getMenteeMatches: builder.query({
      query: (menteeId) => `/matchmaking/mentee/${menteeId}`,
    }),
    getMentorMatches: builder.query({
      query: (mentorId) => `/matchmaking/mentor/${mentorId}`,
    }),

    // Statistics
    getGlobalStatistics: builder.query({
      query: () => '/statistics/global',
    }),
    getUserStatistics: builder.query({
      query: (userId) => `/statistics/user/${userId}`,
    }),
    getTopMentors: builder.query({
      query: () => '/statistics/top-mentors',
    }),
    getPopularSkills: builder.query({
      query: () => '/statistics/popular-skills',
    }),
    getSessionTrends: builder.query({
      query: (days = 30) => `/statistics/session-trends?days=${days}`,
    }),

    // Notifications
    getUserNotifications: builder.query({
      query: (userId) => `/notifications/user/${userId}`,
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation({
      query: ({ id, ...notificationData }) => ({
        url: `/notifications/${id}`,
        method: 'PUT',
        body: { read: true, ...notificationData },
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: (userId) => ({
        url: `/notifications/user/${userId}/mark-all-read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Calendar
    getCalendarAuthUrl: builder.query({
      query: () => '/calendar/auth-url',
    }),
    submitCalendarAuthCode: builder.mutation({
      query: ({ code, userId }) => ({
        url: '/calendar/callback',
        method: 'POST',
        body: { code, user_id: userId },
      }),
    }),
    getCalendarEvents: builder.query({
      query: ({ userId, days = 7 }) => `/calendar/events/${userId}?days=${days}`,
    }),

    // Nuevos endpoints
    getMentors: builder.query<Mentor[], void>({
      query: () => '/mentors',
      providesTags: ['Mentor'],
    }),
    getMentees: builder.query<Mentee[], void>({
      query: () => '/mentees',
      providesTags: ['Mentee'],
    }),
    getSession: builder.query<Session, number>({
      query: (id) => `/sessions/${id}`,
      providesTags: ['Session'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useCreateMentorProfileMutation,
  useUpdateMentorProfileMutation,
  useCreateMenteeProfileMutation,
  useUpdateMenteeProfileMutation,
  useGetSkillsQuery,
  useAddMentorSkillMutation,
  useAddMenteeInterestMutation,
  useGetUserAvailabilityQuery,
  useAddUserAvailabilityMutation,
  useUpdateAvailabilityMutation,
  useDeleteAvailabilityMutation,
  useGetSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useAddSessionFeedbackMutation,
  useGetMenteeMatchesQuery,
  useGetMentorMatchesQuery,
  useGetGlobalStatisticsQuery,
  useGetUserStatisticsQuery,
  useGetTopMentorsQuery,
  useGetPopularSkillsQuery,
  useGetSessionTrendsQuery,
  useGetUserNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetCalendarAuthUrlQuery,
  useSubmitCalendarAuthCodeMutation,
  useGetCalendarEventsQuery,
  useGetMentorsQuery,
  useGetMenteesQuery,
  useGetSessionQuery,
} = api;