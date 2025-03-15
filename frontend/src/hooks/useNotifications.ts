import { useState, useCallback, useEffect } from "react";
import { NotificationService } from "../services/notificationService";
import {
    Notification,
    NotificationSettings,
    NotificationFilters,
    NotificationStats
} from "../types/notification";

export const useNotifications = (initialFilters?: NotificationFilters) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<NotificationFilters | undefined>(initialFilters);

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await NotificationService.getNotifications(filters);
            setNotifications(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading notifications");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const loadSettings = useCallback(async () => {
        try {
            const data = await NotificationService.getNotificationSettings();
            setSettings(data);
        } catch (err) {
            console.error("Error loading notification settings:", err);
        }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const data = await NotificationService.getNotificationStats();
            setStats(data);
        } catch (err) {
            console.error("Error loading notification stats:", err);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    useEffect(() => {
        loadSettings();
        loadStats();
    }, [loadSettings, loadStats]);

    const markAsRead = useCallback(async (notificationId: number) => {
        try {
            await NotificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true, read_at: new Date().toISOString() }
                        : notification
                )
            );
            await loadStats();
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    }, [loadStats]);

    const markAllAsRead = useCallback(async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(notification => ({
                    ...notification,
                    read: true,
                    read_at: new Date().toISOString()
                }))
            );
            await loadStats();
        } catch (err) {
            console.error("Error marking all notifications as read:", err);
        }
    }, [loadStats]);

    const deleteNotification = useCallback(async (notificationId: number) => {
        try {
            await NotificationService.deleteNotification(notificationId);
            setNotifications(prev =>
                prev.filter(notification => notification.id !== notificationId)
            );
            await loadStats();
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    }, [loadStats]);

    const updateSettings = useCallback(async (newSettings: NotificationSettings) => {
        try {
            const updatedSettings = await NotificationService.updateNotificationSettings(newSettings);
            setSettings(updatedSettings);
        } catch (err) {
            console.error("Error updating notification settings:", err);
        }
    }, []);

    return {
        notifications,
        settings,
        stats,
        loading,
        error,
        filters,
        setFilters,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updateSettings,
        refresh: loadNotifications
    };
};
