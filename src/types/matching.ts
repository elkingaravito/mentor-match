export interface Expertise {
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'expert';
}

export interface Availability {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timeZone: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'mentor' | 'mentee';
    expertise: Expertise[];
    availability: Availability[];
    bio: string;
    profilePicture?: string;
}

export interface MatchScore {
    score: number;
    compatibilityFactors: {
        expertiseMatch: number;
        availabilityMatch: number;
        overallFit: number;
    };
}

export interface MentorMatch {
    mentor: UserProfile;
    mentee: UserProfile;
    matchScore: MatchScore;
    availableSlots: Availability[];
}

export interface MatchRecommendationsProps {
    mentorMatches: MentorMatch[];
    isLoading: boolean;
    onMatchSelect: (match: MentorMatch) => void;
    onScheduleMeeting: (match: MentorMatch, slot: Availability) => void;
}