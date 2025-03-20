import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { wsService } from './websocket';
import { API_BASE_URL } from '../config';

export interface UserPresence {
    userId: number;
    status: 'online' | 'offline' | 'away' | 'busy';
    lastSeen: string;
    currentActivity?: {
        type: 'session' | 'messaging' | 'reviewing';
        details?: string;
    };
}

export interface TypingIndicator {
    userId: number;
    targetId: number;
    context: 'chat' | 'feedback' | 'notes';
    timestamp: number;
}

class PresenceService {
    private presenceMap: Map<number, UserPresence> = new Map();
    private typingMap: Map<string, TypingIndicator> = new Map();
    private listeners: Set<(presences: UserPresence[]) => void> = new Set();
    private typingListeners: Set<(indicators: TypingIndicator[]) => void> = new Set();
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor() {
        // Subscribe to presence updates
        wsService.subscribe('presence_update', (presence: UserPresence) => {
            this.updatePresence(presence);
        });

        // Subscribe to typing indicators
        wsService.subscribe('typing_indicator', (indicator: TypingIndicator) => {
            this.updateTypingIndicator(indicator);
        });
    }

    private updatePresence(presence: UserPresence) {
        this.presenceMap.set(presence.userId, presence);
        this.notifyPresenceListeners();
    }

    private updateTypingIndicator(indicator: TypingIndicator) {
        const key = `${indicator.userId}-${indicator.targetId}-${indicator.context}`;
        this.typingMap.set(key, indicator);

        // Clear old typing indicator after 3 seconds
        const timer = this.debounceTimers.get(key);
        if (timer) clearTimeout(timer);

        this.debounceTimers.set(key, setTimeout(() => {
            this.typingMap.delete(key);
            this.notifyTypingListeners();
        }, 3000));

        this.notifyTypingListeners();
    }

    private notifyPresenceListeners() {
        const presences = Array.from(this.presenceMap.values());
        this.listeners.forEach(listener => listener(presences));
    }

    private notifyTypingListeners() {
        const indicators = Array.from(this.typingMap.values());
        this.typingListeners.forEach(listener => listener(indicators));
    }

    subscribeToPresence(callback: (presences: UserPresence[]) => void) {
        this.listeners.add(callback);
        callback(Array.from(this.presenceMap.values()));
        return () => this.listeners.delete(callback);
    }

    subscribeToTyping(callback: (indicators: TypingIndicator[]) => void) {
        this.typingListeners.add(callback);
        callback(Array.from(this.typingMap.values()));
        return () => this.typingListeners.delete(callback);
    }

    updateUserPresence(status: UserPresence['status'], activity?: UserPresence['currentActivity']) {
        wsService['socket']?.emit('presence_update', { status, activity });
    }

    sendTypingIndicator(targetId: number, context: TypingIndicator['context']) {
        wsService['socket']?.emit('typing_indicator', { targetId, context });
    }
}

export const presenceService = new PresenceService();

// RTK Query API
export const presenceApi = createApi({
    reducerPath: 'presenceApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        getUserPresence: builder.query<UserPresence[], number[]>({
            query: (userIds) => ({
                url: '/presence',
                method: 'POST',
                body: { userIds }
            }),
            async onCacheEntryAdded(
                userIds,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                try {
                    await cacheDataLoaded;

                    const unsubscribe = presenceService.subscribeToPresence((presences) => {
                        updateCachedData(() => {
                            return presences.filter(p => userIds.includes(p.userId));
                        });
                    });

                    await cacheEntryRemoved;
                    unsubscribe();
                } catch {}
            }
        })
    })
});

export const { useGetUserPresenceQuery } = presenceApi;