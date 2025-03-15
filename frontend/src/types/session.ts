export interface Session {
    id: number;
    mentor_id: number;
    mentee_id: number;
    start_time: string;
    end_time: string;
    title: string;
    description?: string;
    meeting_link?: string;
    status: SessionStatus;
    calendar_event_id?: string;
    calendar_link?: string;
    created_at: string;
    updated_at: string;
}

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface SessionParticipant {
    id: number;
    name: string;
    email: string;
    role: 'mentor' | 'mentee';
    avatar_url?: string;
}

export interface SessionCreate {
    mentor_id: number;
    mentee_id: number;
    start_time: string;
    end_time: string;
    title: string;
    description?: string;
    meeting_link?: string;
}

export interface SessionUpdate {
    start_time?: string;
    end_time?: string;
    title?: string;
    description?: string;
    meeting_link?: string;
    status?: SessionStatus;
}

export interface SessionFilters {
    startDate?: Date;
    endDate?: Date;
    status?: SessionStatus;
    participantId?: number;
    role?: 'mentor' | 'mentee';
}

export interface SessionStats {
    total: number;
    completed: number;
    cancelled: number;
    upcoming: number;
    averageDuration: number;
    totalHours: number;
}
