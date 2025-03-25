import { baseApi } from './baseApi';
import { API_CONFIG } from '../config/api';
import type { 
  Notification, 
  User,
  ApiResponse 
} from '../types/api';

// Definición de tipos adicionales (para evitar errores)
// Estos pueden ser movidos luego a src/types/api/index.ts
export interface Match {
  id: string;
  mentorId?: string;
  menteeId?: string;
  status: string;
  score: number;
}

export interface Session {
  id: string;
  mentorId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface Statistics {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  averageRating: number;
  totalMentors: number;
  totalMentees: number;
  activeMatches: number;
  matchSuccessRate: number;
  pendingApprovals: number;
}

export interface Mentor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  avatar?: string;
}

export interface Mentee {
  id: string;
  name: string;
  interests: string[];
  avatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  sessionReminders: boolean;
  messageAlerts: boolean;
  newsletterUpdates: boolean;
}

// Re-export the api for store configuration
export const api = baseApi;

// Extend the base API
export const apiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Usuarios
    getUser: builder.query<ApiResponse<User>, void>({
      queryFn: () => {
        return {
          url: '/users/me',
          method: 'GET',
          mockData: {
            success: true,
            message: 'User retrieved successfully',
            data: {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'mentee',
              avatar: 'https://i.pravatar.cc/150?img=1'
            }
          }
        };
      }
    }),
    
    updateProfile: builder.mutation<ApiResponse<User>, Partial<User>>({
      queryFn: (userData) => {
        return {
          url: '/users/me',
          method: 'PUT',
          body: userData,
          mockData: {
            success: true,
            message: 'Profile updated successfully',
            data: {
              id: '1',
              ...userData,
              role: 'mentee',
              email: 'john@example.com'
            }
          }
        };
      },
      invalidatesTags: ['User']
    }),

    // Mentores
    getMentors: builder.query<ApiResponse<Mentor[]>, any>({
      queryFn: (params) => {
        return {
          url: '/mentors',
          method: 'GET',
          params,
          mockData: {
            success: true,
            message: 'Mentors retrieved successfully',
            data: [
              {
                id: 'mentor1',
                name: 'Jane Smith',
                specialization: 'Web Development',
                rating: 4.8,
                avatar: 'https://i.pravatar.cc/150?img=2'
              },
              {
                id: 'mentor2',
                name: 'Michael Johnson',
                specialization: 'Data Science',
                rating: 4.9,
                avatar: 'https://i.pravatar.cc/150?img=3'
              },
              {
                id: 'mentor3',
                name: 'Lisa Brown',
                specialization: 'UI/UX Design',
                rating: 4.7,
                avatar: 'https://i.pravatar.cc/150?img=4'
              }
            ]
          }
        };
      }
    }),

    getMentor: builder.query<ApiResponse<Mentor>, string>({
      queryFn: (id) => {
        return {
          url: `/mentors/${id}`,
          method: 'GET',
          mockData: {
            success: true,
            message: 'Mentor retrieved successfully',
            data: {
              id,
              name: 'Jane Smith',
              specialization: 'Web Development',
              rating: 4.8,
              avatar: 'https://i.pravatar.cc/150?img=2'
            }
          }
        };
      }
    }),

    searchMentors: builder.query<ApiResponse<Mentor[]>, any>({
      queryFn: (searchParams) => {
        return {
          url: '/mentors/search',
          method: 'GET',
          params: searchParams,
          mockData: {
            success: true,
            message: 'Mentors found successfully',
            data: [
              {
                id: 'mentor1',
                name: 'Jane Smith',
                specialization: 'Web Development',
                rating: 4.8,
                avatar: 'https://i.pravatar.cc/150?img=2'
              },
              {
                id: 'mentor2',
                name: 'Michael Johnson',
                specialization: 'Data Science',
                rating: 4.9,
                avatar: 'https://i.pravatar.cc/150?img=3'
              }
            ]
          }
        };
      }
    }),

    // Mentees
    getMentees: builder.query<ApiResponse<Mentee[]>, any>({
      queryFn: (params) => {
        return {
          url: '/mentees',
          method: 'GET',
          params,
          mockData: {
            success: true,
            message: 'Mentees retrieved successfully',
            data: [
              {
                id: 'mentee1',
                name: 'Alex Johnson',
                interests: ['Web Development', 'Mobile Apps'],
                avatar: 'https://i.pravatar.cc/150?img=5'
              },
              {
                id: 'mentee2',
                name: 'Sarah Williams',
                interests: ['Data Science', 'Machine Learning'],
                avatar: 'https://i.pravatar.cc/150?img=6'
              }
            ]
          }
        };
      }
    }),

    // Matches
    getMentorMatches: builder.query<ApiResponse<Match[]>, void>({
      queryFn: () => {
        return {
          url: '/matches/recommendations',
          method: 'GET',
          mockData: {
            success: true,
            message: 'Matches retrieved successfully',
            data: [
              {
                id: '1',
                mentorId: 'mentor1',
                status: 'pending',
                score: 95
              },
              {
                id: '2',
                mentorId: 'mentor2',
                status: 'pending',
                score: 88
              },
              {
                id: '3',
                mentorId: 'mentor3',
                status: 'pending',
                score: 82
              }
            ]
          }
        };
      }
    }),

    getMenteeMatches: builder.query<ApiResponse<Match[]>, void>({
      queryFn: () => {
        return {
          url: '/matches/mentee',
          method: 'GET',
          mockData: {
            success: true,
            message: 'Mentee matches retrieved successfully',
            data: [
              {
                id: '1',
                menteeId: 'mentee1',
                status: 'pending',
                score: 92
              },
              {
                id: '2',
                menteeId: 'mentee2',
                status: 'pending',
                score: 86
              }
            ]
          }
        };
      }
    }),

    // Sesiones
    getSessions: builder.query<ApiResponse<Session[]>, void>({
      queryFn: () => {
        const now = new Date();
        return {
          url: '/sessions',
          method: 'GET',
          mockData: {
            success: true,
            message: 'Sessions retrieved successfully',
            data: [
              {
                id: '1',
                mentorId: 'mentor1',
                title: 'Career Planning Session',
                startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString(),
                status: 'scheduled'
              },
              {
                id: '2',
                mentorId: 'mentor2',
                title: 'Technical Interview Prep',
                startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now.getTime() + 49 * 60 * 60 * 1000).toISOString(),
                status: 'scheduled'
              },
              {
                id: '3',
                mentorId: 'mentor3',
                title: 'Code Review Session',
                startTime: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now.getTime() + 73 * 60 * 60 * 1000).toISOString(),
                status: 'scheduled'
              }
            ]
          }
        };
      }
    }),

    scheduleSession: builder.mutation<ApiResponse<Session>, any>({
      queryFn: (sessionData) => {
        return {
          url: '/sessions',
          method: 'POST',
          body: sessionData,
          mockData: {
            success: true,
            message: 'Session scheduled successfully',
            data: {
              id: Math.random().toString(36).substring(7),
              ...sessionData,
              status: 'scheduled'
            }
          }
        };
      }
    }),

    // Notificaciones
    getNotifications: builder.query<ApiResponse<Notification[]>, void>({
      queryFn: () => {
        return {
          url: '/notifications',
          method: 'GET',
          mockData: {
            success: true,
            message: 'Notifications retrieved successfully',
            data: [
              {
                id: '1',
                message: 'New session scheduled',
                read: false,
                createdAt: new Date().toISOString(),
                type: 'info'
              },
              {
                id: '2',
                message: 'Session completed successfully',
                read: true,
                createdAt: new Date().toISOString(),
                type: 'success'
              },
              {
                id: '3',
                message: 'New mentor match available',
                read: false,
                createdAt: new Date().toISOString(),
                type: 'info'
              }
            ]
          }
        };
      }
    }),

    markNotificationRead: builder.mutation<ApiResponse<void>, number>({
      queryFn: (id) => {
        return {
          url: `/notifications/${id}/read`,
          method: 'POST',
          mockData: {
            success: true,
            message: 'Notification marked as read',
            data: undefined
          }
        };
      }
    }),

    deleteNotification: builder.mutation<ApiResponse<void>, number>({
      queryFn: (id) => {
        return {
          url: `/notifications/${id}`,
          method: 'DELETE',
          mockData: {
            success: true,
            message: 'Notification deleted',
            data: undefined
          }
        };
      }
    }),

    // Mensajes
    getConversations: builder.query<ApiResponse<Conversation[]>, void>({
      queryFn: () => {
        return {
          url: '/messages/conversations',
          method: 'GET',
          mockData: {
            success: true,
            message: 'Conversations retrieved successfully',
            data: [
              {
                id: '1',
                participantId: 'user1',
                participantName: 'Jane Smith',
                lastMessage: 'Hey, how are you?',
                updatedAt: new Date().toISOString(),
                unreadCount: 2
              },
              {
                id: '2',
                participantId: 'user2',
                participantName: 'Mike Johnson',
                lastMessage: 'See you tomorrow!',
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                unreadCount: 0
              }
            ]
          }
        };
      }
    }),

    getMessages: builder.query<ApiResponse<Message[]>, string>({
      queryFn: (conversationId) => {
        const now = new Date();
        return {
          url: `/messages/${conversationId}`,
          method: 'GET',
          mockData: {
            success: true,
            message: 'Messages retrieved successfully',
            data: [
              {
                id: '1',
                conversationId,
                senderId: 'user1',
                content: 'Hello there!',
                timestamp: new Date(now.getTime() - 3600000).toISOString(),
                read: true
              },
              {
                id: '2',
                conversationId,
                senderId: 'currentUser',
                content: 'Hi! How can I help you today?',
                timestamp: new Date(now.getTime() - 3500000).toISOString(),
                read: true
              },
              {
                id: '3',
                conversationId,
                senderId: 'user1',
                content: 'I wanted to discuss our upcoming session.',
                timestamp: new Date(now.getTime() - 3400000).toISOString(),
                read: true
              }
            ]
          }
        };
      }
    }),

    sendMessage: builder.mutation<ApiResponse<Message>, any>({
      queryFn: (messageData) => {
        return {
          url: '/messages',
          method: 'POST',
          body: messageData,
          mockData: {
            success: true,
            message: 'Message sent successfully',
            data: {
              id: Math.random().toString(36).substring(7),
              ...messageData,
              timestamp: new Date().toISOString(),
              read: false,
              senderId: 'currentUser'
            }
          }
        };
      }
    }),

    // Notificación de configuraciones
    getNotificationSettings: builder.query<ApiResponse<NotificationSettings>, void>({
      queryFn: () => {
        return {
          url: '/users/notifications/settings',
          method: 'GET',
          mockData: {
            success: true,
            message: 'Notification settings retrieved successfully',
            data: {
              email: true,
              push: true,
              sms: false,
              sessionReminders: true,
              messageAlerts: true,
              newsletterUpdates: false
            }
          }
        };
      }
    }),

    updateNotificationSettings: builder.mutation<ApiResponse<NotificationSettings>, Partial<NotificationSettings>>({
      queryFn: (settingsData) => {
        return {
          url: '/users/notifications/settings',
          method: 'PUT',
          body: settingsData,
          mockData: {
            success: true,
            message: 'Notification settings updated successfully',
            data: {
              email: true,
              push: true,
              sms: false,
              sessionReminders: true,
              messageAlerts: true,
              newsletterUpdates: false,
              ...settingsData
            }
          }
        };
      }
    }),

    // Estadísticas
    getUserStatistics: builder.query<ApiResponse<Statistics>, void>({
      queryFn: async () => {
        return {
          url: '/statistics/user',
          method: 'GET',
          mockData: {
            success: true,
            message: 'Statistics retrieved successfully',
            data: {
              totalSessions: 15,
              completedSessions: 10,
              upcomingSessions: 5,
              averageRating: 4.5,
              totalMentors: 50,
              totalMentees: 100,
              activeMatches: 45,
              matchSuccessRate: 0.85,
              pendingApprovals: 8,
            }
          }
        };
      }
    }),

    getGlobalStatistics: builder.query<ApiResponse<Statistics>, void>({
      queryFn: () => {
        return {
          url: '/statistics/global',
          method: 'GET',
          mockData: {
            success: true,
            message: 'Global statistics retrieved successfully',
            data: {
              totalSessions: 2500,
              completedSessions: 1800,
              upcomingSessions: 700,
              averageRating: 4.7,
              totalMentors: 150,
              totalMentees: 450,
              activeMatches: 300,
              matchSuccessRate: 0.82,
              pendingApprovals: 25
            }
          }
        };
      }
    }),

    getTopMentors: builder.query<ApiResponse<any[]>, void>({
      queryFn: () => {
        return {
          url: '/statistics/top-mentors',
          method: 'GET',
          mockData: {
            success: true,
            message: 'Top mentors retrieved successfully',
            data: [
              { id: 'mentor1', name: 'Jane Smith', rating: 4.9, sessionsCompleted: 120 },
              { id: 'mentor2', name: 'Michael Johnson', rating: 4.8, sessionsCompleted: 95 },
              { id: 'mentor3', name: 'Lisa Brown', rating: 4.7, sessionsCompleted: 85 }
            ]
          }
        };
      }
    }),

    getPopularSkills: builder.query<ApiResponse<any[]>, void>({
      queryFn: () => {
        return {
          url: '/statistics/popular-skills',
          method: 'GET',
          mockData: {
            success: true,
            message: 'Popular skills retrieved successfully',
            data: [
              { name: 'Web Development', count: 120 },
              { name: 'Data Science', count: 95 },
              { name: 'UI/UX Design', count: 85 },
              { name: 'Machine Learning', count: 75 },
              { name: 'Mobile Development', count: 65 }
            ]
          }
        };
      }
    }),

    getSessionTrends: builder.query<ApiResponse<any[]>, void>({
      queryFn: () => {
        return {
          url: '/statistics/session-trends',
          method: 'GET',
          mockData: {
            success: true,
            message: 'Session trends retrieved successfully',
            data: [
              { month: 'Jan', count: 120 },
              { month: 'Feb', count: 135 },
              { month: 'Mar', count: 115 },
              { month: 'Apr', count: 140 },
              { month: 'May', count: 155 },
              { month: 'Jun', count: 165 }
            ]
          }
        };
      }
    })
  }),
});

// Export hooks
export const { 
  useGetUserQuery,
  useUpdateProfileMutation,
  useGetMentorsQuery,
  useGetMentorQuery,
  useSearchMentorsQuery,
  useGetMenteesQuery,
  useGetMentorMatchesQuery,
  useGetMenteeMatchesQuery,
  useGetSessionsQuery,
  useScheduleSessionMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useGetUserStatisticsQuery,
  useGetGlobalStatisticsQuery,
  useGetTopMentorsQuery,
  useGetPopularSkillsQuery,
  useGetSessionTrendsQuery
} = apiSlice;