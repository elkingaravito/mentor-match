import { useState, useCallback, useEffect } from 'react';
import { SystemSettings } from '../types/settings';

const DEFAULT_SETTINGS: SystemSettings = {
    matching: {
        minCompatibilityScore: 70,
        maxMenteesPerMentor: 5,
        maxSessionsPerWeek: 10,
        autoMatchEnabled: true,
        requireAdminApproval: true,
        matchingCriteria: {
            skills: 40,
            availability: 30,
            experience: 20,
            goals: 10,
        },
    },
    sessions: {
        minDuration: 30,
        maxDuration: 120,
        bufferBetweenSessions: 15,
        cancelationPolicy: {
            deadline: 24,
            penaltyEnabled: true,
            allowRescheduling: true,
        },
        reminderSettings: {
            enabled: true,
            timing: [24, 1],
            channels: ['email', 'push', 'inApp'],
        },
    },
    security: {
        passwordPolicy: {
            minLength: 8,
            requireNumbers: true,
            requireSpecialChars: true,
            requireUppercase: true,
            expirationDays: 90,
        },
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        ipWhitelist: [],
        twoFactorRequired: false,
    },
    notifications: {
        defaultChannels: ['email', 'inApp'],
        batchingEnabled: true,
        batchingInterval: 15,
        quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00',
            timezone: 'UTC',
        },
    },
};

export const useSystemSettings = () => {
    const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/settings');
            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }
            const data = await response.json();
            setSettings(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching settings');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = useCallback(async (newSettings: SystemSettings) => {
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSettings),
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            const data = await response.json();
            setSettings(data);
            setError(null);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error updating settings');
        }
    }, []);

    const resetToDefaults = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/settings/reset', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to reset settings');
            }

            setSettings(DEFAULT_SETTINGS);
            setError(null);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error resetting settings');
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        loading,
        error,
        updateSettings,
        resetToDefaults,
    };
};