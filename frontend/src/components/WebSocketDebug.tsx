import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';

export const WebSocketDebug: React.FC = () => {
    const { isConnected, lastMessage, error } = useWebSocket();
    const { isAuthenticated, user } = useAuth();

    // Solo mostrar en desarrollo
    if (import.meta.env.PROD) {
        return null;
    }

    return (
        <Paper 
            sx={{ 
                position: 'fixed', 
                bottom: 16, 
                right: 16, 
                p: 2, 
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                maxWidth: 300
            }}
        >
            <Typography variant="h6" gutterBottom>WebSocket Debug</Typography>
            <Box>
                <Typography>Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</Typography>
                <Typography>User: {user ? user.name : 'No user'}</Typography>
                <Typography>WS Status: {isConnected ? 'Connected' : 'Disconnected'}</Typography>
                {error && (
                    <Typography color="error">Error: {error}</Typography>
                )}
                {lastMessage && (
                    <Typography>Last Message: {lastMessage}</Typography>
                )}
            </Box>
        </Paper>
    );
};