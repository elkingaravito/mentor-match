export type AuditEventType = 
    | 'user_login'
    | 'user_logout'
    | 'profile_update'
    | 'session_created'
    | 'session_updated'
    | 'session_cancelled'
    | 'match_created'
    | 'match_approved'
    | 'match_rejected'
    | 'settings_updated'
    | 'mentor_approved'
    | 'mentor_suspended'
    | 'security_alert'
    | 'system_error';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditEvent {
    id: string;
    type: AuditEventType;
    severity: AuditSeverity;
    timestamp: string;
    userId?: number;
    userEmail?: string;
    userRole?: string;
    ipAddress: string;
    userAgent: string;
    details: Record<string, any>;
    metadata?: {
        browser?: string;
        os?: string;
        device?: string;
        location?: {
            country?: string;
            city?: string;
            coordinates?: [number, number];
        };
    };
}

export interface AuditFilter {
    startDate?: string;
    endDate?: string;
    types?: AuditEventType[];
    severities?: AuditSeverity[];
    userId?: number;
    userEmail?: string;
    ipAddress?: string;
}

export interface AuditLogResponse {
    events: AuditEvent[];
    total: number;
    page: number;
    pageSize: number;
    summary?: {
        totalEvents: number;
        criticalEvents: number;
        errorEvents: number;
        warningEvents: number;
        uniqueUsers: number;
        uniqueIPs: number;
    };
}