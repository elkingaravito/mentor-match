import { AvailabilitySlot } from './matching';

export type SessionStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Session {
    id: number;
    sessionId: number;
    mentorId: number;
    menteeId: number;
    mentorName: string;
    menteeName: string;
    startTime: string;
    endTime: string;
    status: SessionStatus;
}

export interface CalendarEvent extends Session {
    title: string;
    start: Date;
    end: Date;
    resource?: any;
}

export interface AdminCalendarProps {
    onSessionUpdate: (sessionId: number, status: SessionStatus) => Promise<void>;
    onSessionReassign: (sessionId: number, newMentorId: number) => Promise<void>;
}