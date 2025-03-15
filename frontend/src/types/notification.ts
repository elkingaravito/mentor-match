export interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    related_id?: number;
    read: boolean;
    read_at?: string;
    created_at: string;
}

export type NotificationType = 
    | "session_scheduled"
    | "session_reminder"
    | "session_cancelled"
    | "match_suggested"
    | "match_accepted"
    | "feedback_received"
    | "system";

export interface NotificationSettings {
    email_notifications: boolean;
    push_notifications: boolean;
    session_reminders: boolean;
    match_notifications: boolean;
    feedback_notifications: boolean;
    reminder_time: number; // minutos antes de la sesión
}

export interface NotificationFilters {
    unread_only?: boolean;
    type?: NotificationType;
    startDate?: Date;
    endDate?: Date;
}

export interface NotificationStats {
    total: number;
    unread: number;
    today: number;
}
