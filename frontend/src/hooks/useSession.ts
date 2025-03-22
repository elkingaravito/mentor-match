import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import { useNotifications } from "./useNotifications";
import { useWebSocket } from "../context/WebSocketContext";
import { useAuth } from "./useAuth";
import {
    useGetSessionsQuery,
    useGetSessionByIdQuery,
    useGetSessionStatsQuery,
    useCreateSessionMutation,
    useUpdateSessionMutation,
    useDeleteSessionMutation,
    useRescheduleSessionMutation,
    useCompleteSessionMutation,
    useCancelSessionMutation,
} from "../services/sessionService";
import {
    setActiveSession,
    setFilters,
    clearSessions,
} from "../store/slices/sessionSlice";
import type { SessionWithParticipants, SessionFilters } from "../types/store";
import type { SessionCreate, SessionUpdate } from "../types/api";

export const useSession = (initialFilters?: SessionFilters) => {
    const dispatch = useAppDispatch();
    const { showNotification } = useNotifications();
    const { subscribeToEvent } = useWebSocket();
    const { user } = useAuth();

    const { filters } = useAppSelector(state => state.session);

    // RTK Query hooks
    const { data: sessionsData, isLoading: isLoadingSessions, error: sessionsError } = 
        useGetSessionsQuery(filters);
    const { data: statsData, isLoading: isLoadingStats } = useGetSessionStatsQuery();
    const [createSessionMutation] = useCreateSessionMutation();
    const [updateSessionMutation] = useUpdateSessionMutation();
    const [rescheduleSessionMutation] = useRescheduleSessionMutation();
    const [completeSessionMutation] = useCompleteSessionMutation();
    const [cancelSessionMutation] = useCancelSessionMutation();

    // Suscribirse a actualizaciones de sesiones en tiempo real
    useEffect(() => {
        const unsubscribe = subscribeToEvent('session_update', (data) => {
            showNotification(
                'Actualización de Sesión',
                `La sesión "${data.title}" ha sido actualizada`,
                'session_update'
            );
        });

        return () => unsubscribe();
    }, [subscribeToEvent, showNotification]);

    const createSession = useCallback(async (sessionData: SessionCreate) => {
        try {
            const { data } = await createSessionMutation(sessionData).unwrap();
            showNotification(
                'Nueva Sesión',
                `Se ha creado la sesión "${data.title}"`,
                'session_scheduled'
            );
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error creating session";
            showNotification('Error', errorMessage, 'system', { autoHide: false });
            throw err;
        }
    }, [createSessionMutation, showNotification]);

    const handleUpdateSession = useCallback(async (sessionId: number, update: SessionUpdate) => {
        try {
            const { data } = await updateSessionMutation({ id: sessionId, update }).unwrap();
            showNotification(
                'Sesión Actualizada',
                `Se ha actualizado la sesión "${data.title}"`,
                'session_update'
            );
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error updating session";
            showNotification('Error', errorMessage, 'system', { autoHide: false });
            throw err;
        }
    }, [updateSessionMutation, showNotification]);

    const handleRescheduleSession = useCallback(async (
        sessionId: number,
        startTime: string,
        endTime: string
    ) => {
        try {
            const { data } = await rescheduleSessionMutation({
                id: sessionId,
                startTime,
                endTime
            }).unwrap();
            showNotification(
                'Sesión Reprogramada',
                `La sesión "${data.title}" ha sido reprogramada`,
                'session_update'
            );
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error rescheduling session";
            showNotification('Error', errorMessage, 'system', { autoHide: false });
            throw err;
        }
    }, [rescheduleSessionMutation, showNotification]);

    const handleCompleteSession = useCallback(async (sessionId: number, feedback?: string) => {
        try {
            const { data } = await completeSessionMutation({ id: sessionId, feedback }).unwrap();
            showNotification(
                'Sesión Completada',
                `La sesión "${data.title}" ha sido completada`,
                'session_update'
            );
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error completing session";
            showNotification('Error', errorMessage, 'system', { autoHide: false });
            throw err;
        }
    }, [completeSessionMutation, showNotification]);

    const handleCancelSession = useCallback(async (sessionId: number, reason?: string) => {
        try {
            const { data } = await cancelSessionMutation({ id: sessionId, reason }).unwrap();
            showNotification(
                'Sesión Cancelada',
                `La sesión "${data.title}" ha sido cancelada`,
                'session_update'
            );
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error cancelling session";
            showNotification('Error', errorMessage, 'system', { autoHide: false });
            throw err;
        }
    }, [cancelSessionMutation, showNotification]);

    return {
        // Estado
        sessions: sessionsData?.data || [],
        stats: statsData?.data,
        filters,
        isLoading: isLoadingSessions || isLoadingStats,
        error: sessionsError,
        
        // Acciones
        setFilters: (newFilters: SessionFilters) => dispatch(setFilters(newFilters)),
        setActiveSession: (session: SessionWithParticipants | null) => 
            dispatch(setActiveSession(session)),
        createSession,
        updateSession: handleUpdateSession,
        rescheduleSession: handleRescheduleSession,
        completeSession: handleCompleteSession,
        cancelSession: handleCancelSession,
        clearSessions: () => dispatch(clearSessions()),
        
        // Utilidades
        isAdmin: user?.role === "admin",
        userId: user?.id
    };
};
