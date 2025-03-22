import { useState, useCallback, useEffect } from 'react';
import { 
    AuditEvent, 
    AuditFilter, 
    AuditLogResponse 
} from '../types/audit';

export const useAuditLog = () => {
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<AuditLogResponse['summary']>();

    const fetchEvents = useCallback(async (filters: AuditFilter = {}) => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/audit-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch audit logs');
            }

            const data: AuditLogResponse = await response.json();
            setEvents(data.events);
            setSummary(data.summary);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching audit logs');
        } finally {
            setLoading(false);
        }
    }, []);

    const exportEvents = useCallback(async (
        format: 'csv' | 'json',
        filters: AuditFilter = {}
    ) => {
        try {
            const response = await fetch(`/api/admin/audit-log/export/${format}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            if (!response.ok) {
                throw new Error('Failed to export audit logs');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_log_${new Date().toISOString()}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error exporting audit logs');
        }
    }, []);

    const getEventDetails = useCallback(async (eventId: string) => {
        try {
            const response = await fetch(`/api/admin/audit-log/${eventId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch event details');
            }
            return await response.json();
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error fetching event details');
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return {
        events,
        loading,
        error,
        summary,
        fetchEvents,
        exportEvents,
        getEventDetails,
    };
};