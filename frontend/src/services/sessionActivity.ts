import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { wsService } from './websocket';
import { API_BASE_URL } from '../config';

export interface SessionActivity {
    sessionId: number;
    userId: number;
    type: 'note' | 'code' | 'question' | 'feedback' | 'resource';
    content: string;
    timestamp: string;
    metadata?: {
        language?: string;
        url?: string;
        tags?: string[];
        status?: 'pending' | 'resolved';
    };
}

export interface SessionParticipant {
    userId: number;
    role: 'mentor' | 'mentee';
    activeTab?: string;
    viewingActivity?: {
        type: SessionActivity['type'];
        id: number;
    };
    lastActivity?: string;
}

class SessionActivityService {
    private participants: Map<number, Map<number, SessionParticipant>> = new Map(); // sessionId -> Map<userId, participant>
    private activities: Map<number, SessionActivity[]> = new Map(); // sessionId -> activities
    private listeners: Map<number, Set<(activities: SessionActivity[]) => void>> = new Map();
    private participantListeners: Map<number, Set<(participants: SessionParticipant[]) => void>> = new Map();

    constructor() {
        wsService.subscribe('session_activity', (data: { 
            sessionId: number;
            activity: SessionActivity;
        }) => {
            this.addActivity(data.sessionId, data.activity);
        });

        wsService.subscribe('session_participant_update', (data: {
            sessionId: number;
            participant: SessionParticipant;
        }) => {
            this.updateParticipant(data.sessionId, data.participant);
        });
    }

    private addActivity(sessionId: number, activity: SessionActivity) {
        if (!this.activities.has(sessionId)) {
            this.activities.set(sessionId, []);
        }
        this.activities.get(sessionId)?.push(activity);
        this.notifyActivityListeners(sessionId);
    }

    private updateParticipant(sessionId: number, participant: SessionParticipant) {
        if (!this.participants.has(sessionId)) {
            this.participants.set(sessionId, new Map());
        }
        this.participants.get(sessionId)?.set(participant.userId, participant);
        this.notifyParticipantListeners(sessionId);
    }

    private notifyActivityListeners(sessionId: number) {
        const activities = this.activities.get(sessionId) || [];
        this.listeners.get(sessionId)?.forEach(listener => listener(activities));
    }

    private notifyParticipantListeners(sessionId: number) {
        const participants = Array.from(this.participants.get(sessionId)?.values() || []);
        this.participantListeners.get(sessionId)?.forEach(listener => listener(participants));
    }

    subscribeToActivities(sessionId: number, callback: (activities: SessionActivity[]) => void) {
        if (!this.listeners.has(sessionId)) {
            this.listeners.set(sessionId, new Set());
        }
        this.listeners.get(sessionId)?.add(callback);
        callback(this.activities.get(sessionId) || []);
        return () => this.listeners.get(sessionId)?.delete(callback);
    }

    subscribeToParticipants(sessionId: number, callback: (participants: SessionParticipant[]) => void) {
        if (!this.participantListeners.has(sessionId)) {
            this.participantListeners.set(sessionId, new Set());
        }
        this.participantListeners.get(sessionId)?.add(callback);
        callback(Array.from(this.participants.get(sessionId)?.values() || []));
        return () => this.participantListeners.get(sessionId)?.delete(callback);
    }

    updateUserActivity(sessionId: number, activity: Partial<SessionParticipant>) {
        wsService['socket']?.emit('session_participant_update', { sessionId, activity });
    }

    addSessionActivity(sessionId: number, activity: Omit<SessionActivity, 'timestamp'>) {
        wsService['socket']?.emit('session_activity', { 
            sessionId, 
            activity: { ...activity, timestamp: new Date().toISOString() }
        });
    }
}

export const sessionActivityService = new SessionActivityService();

// RTK Query API
export const sessionActivityApi = createApi({
    reducerPath: 'sessionActivityApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        getSessionActivities: builder.query<SessionActivity[], number>({
            query: (sessionId) => `/sessions/${sessionId}/activities`,
            async onCacheEntryAdded(
                sessionId,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                try {
                    await cacheDataLoaded;

                    const unsubscribe = sessionActivityService.subscribeToActivities(
                        sessionId,
                        (activities) => {
                            updateCachedData(() => activities);
                        }
                    );

                    await cacheEntryRemoved;
                    unsubscribe();
                } catch {}
            }
        }),
        getSessionParticipants: builder.query<SessionParticipant[], number>({
            query: (sessionId) => `/sessions/${sessionId}/participants`,
            async onCacheEntryAdded(
                sessionId,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                try {
                    await cacheDataLoaded;

                    const unsubscribe = sessionActivityService.subscribeToParticipants(
                        sessionId,
                        (participants) => {
                            updateCachedData(() => participants);
                        }
                    );

                    await cacheEntryRemoved;
                    unsubscribe();
                } catch {}
            }
        })
    })
});

export const {
    useGetSessionActivitiesQuery,
    useGetSessionParticipantsQuery
} = sessionActivityApi;