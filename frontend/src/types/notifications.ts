export type NotificationType = 
    | 'session_request'
    | 'session_update'
    | 'mentor_application'
    | 'match_suggestion'
    | 'system_alert'
    | 'user_report';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface BaseNotification {
    id: number;
    message: string;
    read: boolean;
    createdAt: string;
    type: NotificationType;
    priority: NotificationPriority;
}

export interface SessionNotification extends BaseNotification {
    type: 'session_request' | 'session_update';
    sessionId: number;
    mentorId: number;
    menteeId: number;
}

export interface MentorApplicationNotification extends BaseNotification {
    type: 'mentor_application';
    applicationId: number;
    userId: number;
}

export interface MatchSuggestionNotification extends BaseNotification {
    type: 'match_suggestion';
    matchId: number;
    score: number;
}

export interface SystemAlertNotification extends BaseNotification {
    type: 'system_alert';
    alertCode: string;
    affectedUsers?: number[];
}

export interface UserReportNotification extends BaseNotification {
    type: 'user_report';
    reportId: number;
    reporterId: number;
    reportedId: number;
}

export type Notification = 
    | SessionNotification 
    | MentorApplicationNotification 
    | MatchSuggestionNotification 
    | SystemAlertNotification 
    | UserReportNotification;