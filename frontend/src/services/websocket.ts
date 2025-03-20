import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { io, Socket } from 'socket.io-client';
import { WS_BASE_URL, WS_CONFIG } from '../config';

// Tipos de eventos específicos
interface StatsUpdate {
    activeUsers: number;
    totalSessions: number;
    completionRate: number;
}

interface GoalsUpdate {
    id: string;
    title: string;
    progress: number;
    status: 'pending' | 'completed' | 'failed';
}

interface SessionUpdate {
    id: string;
    status: 'active' | 'completed' | 'cancelled';
    participants: string[];
    duration: number;
}

type WebSocketEventMap = {
    'stats_update': StatsUpdate;
    'goals_update': GoalsUpdate;
    'sessions_update': SessionUpdate;
}

interface WebSocketMessage<T = unknown> {
    type: keyof WebSocketEventMap;
    payload: T;
}

class WebSocketService {
    private socket: Socket | null = null;
    private listeners: Map<keyof WebSocketEventMap, Set<(data: any) => void>> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private connectionTimeout = 5000;

    connect() {
        if (!this.socket) {
            const token = localStorage.getItem('token');
            console.log('[WebSocket] Connecting with token:', token ? 'Present' : 'Not found');
            
            this.socket = io(WS_BASE_URL, {
                ...WS_CONFIG,
                auth: {
                    token
                },
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5
            });

            // Log all socket events in development
            if (import.meta.env.DEV) {
                this.socket.onAny((event, ...args) => {
                    console.log('[WebSocket] Event:', event, 'Args:', args);
                });
            }

            this.socket.on('connect', () => {
                console.log('[WebSocket] Connected');
                this.reconnectAttempts = 0;
            });

            this.socket.on('disconnect', (reason) => {
                console.log('[WebSocket] Disconnected:', reason);
                if (reason === 'io server disconnect') {
                    console.log('[WebSocket] Server disconnected, attempting reconnect...');
                    this.socket?.connect();
                }
            });

            this.socket.on('connect_error', (error) => {
                console.error('[WebSocket] Connection error:', error.message);
                this.reconnectAttempts++;
                console.log(`[WebSocket] Reconnection attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`);
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error('[WebSocket] Max reconnection attempts reached');
                    this.disconnect();
                }
            });

            // Add ping/pong monitoring
            this.socket.on('ping', () => {
                console.log('[WebSocket] Ping sent');
            });

            this.socket.on('pong', (latency) => {
                console.log('[WebSocket] Pong received, latency:', latency, 'ms');
            });

            // Monitor connection state changes
            this.socket.on('connecting', () => {
                console.log('[WebSocket] Attempting connection...');
            });

            this.socket.on('reconnecting', (attemptNumber) => {
                console.log('[WebSocket] Attempting reconnection:', attemptNumber);
            });

            this.socket.on('reconnect_failed', () => {
                console.error('[WebSocket] Reconnection failed');
            });

            // Handle incoming messages with type checking
            this.socket.on('message', <T extends keyof WebSocketEventMap>(message: WebSocketMessage<WebSocketEventMap[T]>) => {
                const { type, payload } = message;
                this.notifyListeners(type, payload);
            });

            this.socket.on('error', (error) => {
                console.error('WebSocket error:', error);
                // Emitir el error a los listeners de error si existen
                this.notifyListeners('error' as keyof WebSocketEventMap, error);
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    subscribe<T extends keyof WebSocketEventMap>(
        type: T,
        callback: (data: WebSocketEventMap[T]) => void
    ) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type)?.add(callback);

        return () => {
            const listeners = this.listeners.get(type);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.listeners.delete(type);
                }
            }
        };
    }

    private notifyListeners<T extends keyof WebSocketEventMap>(
        type: T,
        data: WebSocketEventMap[T]
    ) {
        const listeners = this.listeners.get(type);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }

    // Método para verificar el estado de la conexión
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    // Método para forzar una reconexión
    reconnect(): void {
        if (this.socket && !this.socket.connected && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.socket.connect();
        }
    }
}

export const wsService = new WebSocketService();

// RTK Query WebSocket API
export const wsApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: '/' }),
    endpoints: (builder) => ({
        getUpdates: builder.query<void, void>({
            queryFn: () => ({ data: undefined }),
            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                try {
                    await cacheDataLoaded;

                    wsService.connect();

                    const unsubscribeStats = wsService.subscribe('stats_update', (data: StatsUpdate) => {
                        updateCachedData((draft) => {
                            if (draft) {
                                draft.stats = data;
                            }
                        });
                    });

                    const unsubscribeGoals = wsService.subscribe('goals_update', (data: GoalsUpdate) => {
                        updateCachedData((draft) => {
                            if (draft) {
                                draft.goals = data;
                            }
                        });
                    });

                    const unsubscribeSessions = wsService.subscribe('sessions_update', (data: SessionUpdate) => {
                        updateCachedData((draft) => {
                            if (draft) {
                                draft.sessions = data;
                            }
                        });
                    });

                    await cacheEntryRemoved;

                    unsubscribeStats();
                    unsubscribeGoals();
                    unsubscribeSessions();
                    wsService.disconnect();
                } catch {
                    // Handle errors
                }
            },
        }),
    }),
});

export const { useGetUpdatesQuery } = wsApi;
