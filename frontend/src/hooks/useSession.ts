import { useState, useCallback, useEffect } from "react";
import { SessionService } from "../services/sessionService";
import {
    Session,
    SessionCreate,
    SessionUpdate,
    SessionFilters,
    SessionStats
} from "../types/session";
import { useAuth } from "./useAuth";

export const useSession = (initialFilters?: SessionFilters) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [stats, setStats] = useState<SessionStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<SessionFilters | undefined>(initialFilters);
    const { user } = useAuth();

    const loadSessions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await SessionService.getSessions(filters);
            setSessions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading sessions");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const loadStats = useCallback(async () => {
        try {
            const data = await SessionService.getSessionStats();
            setStats(data);
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }, []);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const createSession = useCallback(async (session: SessionCreate) => {
        try {
            setLoading(true);
            setError(null);
            const newSession = await SessionService.createSession(session);
            setSessions(prev => [...prev, newSession]);
            return newSession;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error creating session");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSession = useCallback(async (sessionId: number, update: SessionUpdate) => {
        try {
            setLoading(true);
            setError(null);
            const updatedSession = await SessionService.updateSession(sessionId, update);
            setSessions(prev =>
                prev.map(session =>
                    session.id === sessionId ? updatedSession : session
                )
            );
            return updatedSession;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating session");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteSession = useCallback(async (sessionId: number) => {
        try {
            setLoading(true);
            setError(null);
            await SessionService.deleteSession(sessionId);
            setSessions(prev => prev.filter(session => session.id !== sessionId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error deleting session");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const rescheduleSession = useCallback(async (
        sessionId: number,
        newStartTime: string,
        newEndTime: string
    ) => {
        try {
            setLoading(true);
            setError(null);
            const updatedSession = await SessionService.rescheduleSession(
                sessionId,
                newStartTime,
                newEndTime
            );
            setSessions(prev =>
                prev.map(session =>
                    session.id === sessionId ? updatedSession : session
                )
            );
            return updatedSession;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error rescheduling session");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const completeSession = useCallback(async (sessionId: number, feedback?: string) => {
        try {
            setLoading(true);
            setError(null);
            const updatedSession = await SessionService.markSessionComplete(sessionId, feedback);
            setSessions(prev =>
                prev.map(session =>
                    session.id === sessionId ? updatedSession : session
                )
            );
            await loadStats();
            return updatedSession;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error completing session");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadStats]);

    const cancelSession = useCallback(async (sessionId: number, reason?: string) => {
        try {
            setLoading(true);
            setError(null);
            const updatedSession = await SessionService.cancelSession(sessionId, reason);
            setSessions(prev =>
                prev.map(session =>
                    session.id === sessionId ? updatedSession : session
                )
            );
            await loadStats();
            return updatedSession;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error cancelling session");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadStats]);

    return {
        sessions,
        stats,
        loading,
        error,
        filters,
        setFilters,
        createSession,
        updateSession,
        deleteSession,
        rescheduleSession,
        completeSession,
        cancelSession,
        refresh: loadSessions,
        isAdmin: user?.role === "admin",
        userId: user?.id
    };
};
