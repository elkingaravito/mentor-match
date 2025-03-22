import { useState, useCallback } from 'react';
import { Session } from '../types/calendar';
import { AvailabilitySlot } from '../types/matching';

export const useCalendar = () => {
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAvailability = useCallback(async (start: Date, end: Date) => {
        setLoading(true);
        try {
            // Implementar llamada a API para cargar disponibilidad y sesiones
            const response = await fetch(`/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`);
            const data = await response.json();
            setAvailability(data.availability);
            setSessions(data.sessions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading calendar data');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        availability,
        sessions,
        loading,
        error,
        loadAvailability,
    };
};