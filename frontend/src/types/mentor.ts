export type MentorStatus = 'pending' | 'active' | 'inactive' | 'suspended';

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert';

export interface MentorSkill {
    id: number;
    name: string;
    level: ExpertiseLevel;
    yearsOfExperience: number;
}

export interface MentorAvailability {
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
}

export interface MentorProfile {
    id: number;
    userId: number;
    name: string;
    email: string;
    bio: string;
    title: string;
    company: string;
    linkedinUrl?: string;
    githubUrl?: string;
    website?: string;
    status: MentorStatus;
    skills: MentorSkill[];
    availability: MentorAvailability[];
    averageRating: number;
    totalSessions: number;
    completedSessions: number;
    successRate: number;
    createdAt: string;
    updatedAt: string;
}

export interface MentorFilter {
    status?: MentorStatus[];
    skills?: string[];
    availability?: boolean;
    minRating?: number;
    minSessions?: number;
    searchTerm?: string;
}

export interface MentorSort {
    field: keyof MentorProfile | 'rating' | 'sessions';
    direction: 'asc' | 'desc';
}

export interface MentorListResponse {
    mentors: MentorProfile[];
    total: number;
    page: number;
    pageSize: number;
}