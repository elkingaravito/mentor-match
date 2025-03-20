import React, { createContext, useContext, useEffect, useState } from 'react';
import { wsService } from '../services/websocket';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
    isConnected: boolean;
    lastMessage: string | null;
    connect: () => void;
    disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
    isConnected: false,
    lastMessage: null,
    connect: () => {},
    disconnect: () => {}
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            try {
                connect();
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                console.error('[WebSocket] Connection error:', errorMessage);
                setError(errorMessage);
            }
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [isAuthenticated]);

    const connect = () => {
        wsService.connect();
        setIsConnected(true);

        // Suscribirse a actualizaciones
        const unsubscribeStats = wsService.subscribe('stats_update', (data) => {
            setLastMessage(`Stats updated: ${data.activeUsers} active users`);
        });

        return () => {
            unsubscribeStats();
        };
    };

    const disconnect = () => {
        wsService.disconnect();
        setIsConnected(false);
        setLastMessage(null);
    };

    return (
        <WebSocketContext.Provider value={{ 
            isConnected, 
            lastMessage,
            connect,
            disconnect
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};
