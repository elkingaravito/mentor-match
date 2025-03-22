import React from 'react';
import { Box, Typography } from '@mui/material';
import { AdminCalendar } from '../components/calendar/AdminCalendar';
import { SessionStatus } from '../types/calendar';

export const AdminCalendarPage: React.FC = () => {
    const handleSessionUpdate = async (sessionId: number, status: SessionStatus) => {
        try {
            const response = await fetch(`/api/sessions/${sessionId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update session status');
            }
        } catch (error) {
            console.error('Error updating session:', error);
            // Implementar manejo de errores apropiado
        }
    };

    const handleSessionReassign = async (sessionId: number, newMentorId: number) => {
        try {
            const response = await fetch(`/api/sessions/${sessionId}/reassign`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mentorId: newMentorId }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to reassign session');
            }
        } catch (error) {
            console.error('Error reassigning session:', error);
            // Implementar manejo de errores apropiado
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Session Management
            </Typography>
            <AdminCalendar
                onSessionUpdate={handleSessionUpdate}
                onSessionReassign={handleSessionReassign}
            />
        </Box>
    );
};