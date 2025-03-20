// API Response Types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
}

export interface ApiError {
    message: string;
    code: string;
    status: number;
    details?: Record<string, any>;
}

// Authentication Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

// User Types
export type UserRole = 'mentor' | 'mentee' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile extends User {
    bio?: string;
    skills?: string[];
    interests?: string[];
    location?: string;
    timezone?: string;
    availability?: string[];
    profilePicture?: string;
}

// Session Types
export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface Session {
    id: number;
    mentorId: number;
    menteeId: number;
    startTime: string;
    endTime: string;
    status: SessionStatus;
    notes?: string;
    feedback?: SessionFeedback;
    createdAt: string;
    updatedAt: string;
}

export interface SessionFeedback {
    rating: number;
    comment?: string;
    createdAt: string;
}

// Notification Types
export type NotificationType = 'match' | 'session' | 'message' | 'system';

export interface Notification {
    id: number;
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    data?: Record<string, any>;
    createdAt: string;
}

// Match Types
export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Match {
    id: number;
    mentorId: number;
    menteeId: number;
    score: number;
    status: MatchStatus;
    createdAt: string;
    expiresAt?: string;
}

// Statistics Types
export interface UserStatistics {
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    averageRating: number;
    totalMentees?: number; // for mentors
    totalMentors?: number; // for mentees
    sessionsByStatus: Record<SessionStatus, number>;
    ratingDistribution: Record<number, number>;
}

export interface GlobalStatistics {
    totalUsers: number;
    totalMentors: number;
    totalMentees: number;
    totalSessions: number;
    activeUsers: number;
    completionRate: number;
    averageRating: number;
    topSkills: Array<{ skill: string; count: number }>;
    userGrowth: Array<{ date: string; count: number }>;
    sessionTrends: Array<{ date: string; count: number }>;
}

// Pagination and Filtering
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
    search?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    [key: string]: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}