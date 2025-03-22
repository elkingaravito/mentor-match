export interface MatchPreference {
    skill_weight: number;
    availability_weight: number;
    style_weight: number;
    goals_weight: number;
    preferred_meeting_frequency?: number;
    preferred_session_duration?: number;
    timezone?: string;
    language_preferences?: string[];
    industry_preferences?: string[];
    custom_criteria?: Record<string, any>;
    exclusions?: Record<string, any>;
}

export interface MatchScore {
    id: number;
    mentor_id: number;
    mentee_id: number;
    total_score: number;
    skill_match_score: number;
    availability_score: number;
    style_match_score: number;
    goals_alignment_score: number;
    match_details: {
        matching_skills: string[];
        matching_availability: number;
        [key: string]: any;
    };
    status: "suggested" | "accepted" | "rejected" | "active";
    created_at: string;
    updated_at: string;
}

export interface Match {
    mentor: {
        id: number;
        name: string;
        rating?: number;
        total_sessions?: number;
    };
    mentee: {
        id: number;
        name: string;
    };
    compatibility_score: number;
    common_interests: string[];
    status: 'pending' | 'accepted' | 'rejected';
    match_score: MatchScore;
}

export interface MatchFeedback {
    rating: number;
    feedback?: string;
    suggestions?: string;
}

export interface MentorProfile {
    user_id: number;
    name: string;
    bio?: string;
    experience_years?: number;
    company?: string;
    position?: string;
    expertise_areas: string[];
    mentoring_style?: string;
    availability: AvailabilitySlot[];
}

export interface MenteeProfile {
    user_id: number;
    name: string;
    bio?: string;
    goals?: string;
    current_position?: string;
    desired_skills: string[];
    learning_style?: string;
    availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
    id: number;
    start_time: string;
    end_time: string;
    recurrence?: string;
    is_available: boolean;
}
