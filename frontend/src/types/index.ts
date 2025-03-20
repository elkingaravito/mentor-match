// User types
export interface User {
    id: number;
    email: string;
    name: string;
    role: 'mentor' | 'mentee' | 'admin';
    created_at: string;
    updated_at?: string;
}

export interface Mentor extends User {
    expertise: string[];
    availability: Availability[];
    bio: string;
    rating?: number;
    total_sessions?: number;
}

export interface Mentee extends User {
    interests: string[];
    goals: string[];
    preferred_times: Availability[];
}

// Session types
export interface Session {
    id: number;
    mentor_id: number;
    mentee_id: number;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
    feedback?: SessionFeedback;
    created_at: string;
}

export interface SessionFeedback {
    rating: number;
    comments: string;
    areas_of_improvement?: string[];
    strengths?: string[];
}

// Notification types
export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    created_at: string;
    read_at?: string;
}

export type NotificationType = 
    | 'session_scheduled'
    | 'session_reminder'
    | 'session_cancelled'
    | 'new_match'
    | 'feedback_received'
    | 'system_notification';

// Statistics types
export interface Statistics {
    total_sessions: number;
    completed_sessions: number;
    average_rating?: number;
    total_hours: number;
    popular_topics?: string[];
    recent_activity?: Activity[];
}

export interface Activity {
    type: 'session' | 'feedback' | 'match';
    date: string;
    description: string;
}

// Matching types
export interface Match {
    mentor: Mentor;
    mentee: Mentee;
    compatibility_score: number;
    common_interests: string[];
    available_times: Availability[];
}

export interface Availability {
    day: string;
    start_time: string;
    end_time: string;
}
