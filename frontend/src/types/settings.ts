export interface NotificationSetting {
    id: string;
    type: NotificationType;
    description: string;
    enabled: boolean;
    channels: {
        email: boolean;
        push: boolean;
        inApp: boolean;
    };
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    emailNotifications: boolean;
    pushNotifications: boolean;
    availability: {
        [key: string]: {
            enabled: boolean;
            slots: {
                start: string;
                end: string;
            }[];
        };
    };
}

export interface SystemSettings {
    matching: {
        minCompatibilityScore: number;
        maxMenteesPerMentor: number;
        maxSessionsPerWeek: number;
        autoMatchEnabled: boolean;
        requireAdminApproval: boolean;
        matchingCriteria: {
            skills: number;
            availability: number;
            experience: number;
            goals: number;
        };
    };
    sessions: {
        minDuration: number;
        maxDuration: number;
        bufferBetweenSessions: number;
        cancelationPolicy: {
            deadline: number; // hours before session
            penaltyEnabled: boolean;
            allowRescheduling: boolean;
        };
        reminderSettings: {
            enabled: boolean;
            timing: number[]; // hours before session
            channels: ('email' | 'push' | 'inApp')[];
        };
    };
    security: {
        passwordPolicy: {
            minLength: number;
            requireNumbers: boolean;
            requireSpecialChars: boolean;
            requireUppercase: boolean;
            expirationDays: number;
        };
        sessionTimeout: number;
        maxLoginAttempts: number;
        ipWhitelist: string[];
        twoFactorRequired: boolean;
    };
    notifications: {
        defaultChannels: ('email' | 'push' | 'inApp')[];
        batchingEnabled: boolean;
        batchingInterval: number;
        quietHours: {
            enabled: boolean;
            start: string;
            end: string;
            timezone: string;
        };
    };
}

export interface SecuritySettings {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    activeSessions: {
        id: string;
        device: string;
        location: string;
        lastActive: string;
        current: boolean;
    }[];
    auditLog: {
        id: string;
        action: string;
        timestamp: string;
        ip: string;
        userAgent: string;
        success: boolean;
    }[];
}

export interface ProfileUpdateRequest {
    name?: string;
    bio?: string;
    location?: string;
    skills?: string[];
    avatar?: File;
    title?: string;
    experience?: string;
    education?: {
        degree: string;
        institution: string;
        year: number;
    }[];
    certifications?: {
        name: string;
        issuer: string;
        year: number;
    }[];
    languages?: string[];
    hourlyRate?: number;
}

export interface SettingsUpdateResponse {
    success: boolean;
    message: string;
    updatedAt: string;
}
