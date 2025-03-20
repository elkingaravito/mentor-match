// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// WebSocket Configuration
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export const WS_CONFIG = {
    path: '/socket.io',
    transports: ['websocket'],
    secure: false,
    rejectUnauthorized: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 5000,
};

// Authentication Configuration
export const AUTH_CONFIG = {
    tokenKey: 'token',
    userKey: 'user',
};

// Application Configuration
export const APP_CONFIG = {
    appName: 'Mentor Match',
    version: '1.0.0',
    environment: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
};

// API Endpoints Configuration
export const API_ENDPOINTS = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
    },
    users: {
        profile: '/users/profile',
        mentors: '/users/mentors',
        mentees: '/users/mentees',
        mentorProfile: '/users/mentor-profile',
        menteeProfile: '/users/mentee-profile',
    },
    statistics: {
        user: '/statistics/user',
        global: '/statistics/global',
        topMentors: '/statistics/top-mentors',
        popularSkills: '/statistics/popular-skills',
        sessionTrends: '/statistics/session-trends',
    },
    sessions: {
        base: '/sessions',
        byId: (id: number) => `/sessions/${id}`,
    },
    notifications: {
        base: '/notifications',
    },
    matching: {
        menteeMatches: '/matching/mentee',
        mentorMatches: '/matching/mentor',
    },
};
