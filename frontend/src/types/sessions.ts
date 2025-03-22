export type SessionStatus = 
    | 'scheduled'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'rescheduled'
    | 'no_show';

export type SessionType = 
    | 'introduction'
    | 'mentoring'
    | 'review'
    | 'workshop'
    | 'group';

export interface SessionParticipant {
    id: number;
    name: string;
    email: string;
    role: 'mentor' | 'mentee';
    status: 'confirmed' | 'pending' | 'declined';
    joinedAt?: string;
    leftAt?: string;
}

export interface SessionFeedback {
    id: number;
    userId: number;
    rating: number;
    comment?: string;
    areas: string[];
    improvements?: string[];
    createdAt: string;
}

export interface SessionNote {
    id: number;
    userId: number;
    content: string;
    visibility: 'private' | 'participants' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface Session {
    id: number;
    type: SessionType;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: SessionStatus;
    participants: SessionParticipant[];
    feedback?: SessionFeedback[];
    notes?: SessionNote[];
    meetingUrl?: string;
    recordingUrl?: string;
    resources?: {
        id: number;
        name: string;
        url: string;
        type: string;
    }[];
    metadata: {
        platform: string;
        timezone: string;
        scheduledBy: number;
        lastModifiedBy: number;
        cancellationReason?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface SessionFilter {
    startDate?: string;
    endDate?: string;
    status?: SessionStatus[];
    type?: SessionType[];
    mentorId?: number;
    menteeId?: number;
    searchTerm?: string;
}

export interface SessionUpdateRequest {
    id: number;
    status?: SessionStatus;
    startTime?: string;
    endTime?: string;
    meetingUrl?: string;
    notes?: Omit<SessionNote, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface SessionsResponse {
    sessions: Session[];
    total: number;
    page: number;
    pageSize: number;
    summary?: {
        totalSessions: number;
        completedSessions: number;
        upcomingSessions: number;
        averageRating: number;
    };
}