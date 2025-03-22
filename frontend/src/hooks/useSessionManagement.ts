import { useState, useCallback, useEffect } from 'react';
import { 
    Session, 
    SessionFilter, 
    SessionUpdateRequest,
    SessionsResponse 
} from '../types/sessions';

export const useSessionManagement = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<SessionsResponse['summary']>();

    const fetchSessions = useCallback(async (filters: SessionFilter = {}) => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sessions');
            }

            const data: SessionsResponse = await response.json();
            setSessions(data.sessions);
            setSummary(data.summary);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching sessions');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSession = useCallback(async (sessionData: SessionUpdateRequest) => {
        try {
            const response = await fetch(`/api/admin/sessions/${sessionData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sessionData),
            });

            if (!response.ok) {
                throw new Error('Failed to update session');
            }

            await fetchSessions();
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error updating session');
        }
    }, [fetchSessions]);

    const deleteSession = useCallback(async (sessionId: number) => {
        try {
            const response = await fetch(`/api/admin/sessions/${sessionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete session');
            }

            await fetchSessions();
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error deleting session');
        }
    }, [fetchSessions]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return {
        sessions,
        loading,
        error,
        summary,
        fetchSessions,
        updateSession,
        deleteSession,
    };
};