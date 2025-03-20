export interface User {
    id: number;
    name: string;
    email: string;
    role: 'mentor' | 'mentee' | 'admin';
}

export interface Session {
    id: number;
    mentorId: number;
    menteeId: number;
    startTime: Date;
    endTime: Date;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Notification {
    id: number;
    userId: number;
    type: string;
    message: string;
    read: boolean;
    createdAt: Date;
}