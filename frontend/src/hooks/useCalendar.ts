import { useState, useCallback } from "react";
import { CalendarService } from "../services/calendarService";
import { AvailabilitySlot } from "../types/matching";
import { useAuth } from "../context/AuthContext";

export const useCalendar = () => {
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const loadAvailability = useCallback(async (startDate: Date, endDate: Date) => {
        if (!user) return;
        
        try {
            setLoading(true);
            setError(null);
            const data = await CalendarService.getUserAvailability(user.id, startDate, endDate);
            setAvailability(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading availability");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const createAvailability = useCallback(async (slot: Omit<AvailabilitySlot, "id">) => {
        try {
            setLoading(true);
            setError(null);
            const newSlot = await CalendarService.createAvailability(slot);
            setAvailability(prev => [...prev, newSlot]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error creating availability");
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteAvailability = useCallback(async (slotId: number) => {
        try {
            setLoading(true);
            setError(null);
            await CalendarService.deleteAvailability(slotId);
            setAvailability(prev => prev.filter(slot => slot.id !== slotId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error deleting availability");
        } finally {
            setLoading(false);
        }
    }, []);

    const integrateCalendar = useCallback(async (provider: string, authCode: string) => {
        try {
            setLoading(true);
            setError(null);
            await CalendarService.integrateCalendar(provider, authCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error integrating calendar");
        } finally {
            setLoading(false);
        }
    }, []);

    const syncCalendar = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            await CalendarService.syncCalendar();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error syncing calendar");
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        availability,
        loading,
        error,
        loadAvailability,
        createAvailability,
        deleteAvailability,
        integrateCalendar,
        syncCalendar
    };
};
