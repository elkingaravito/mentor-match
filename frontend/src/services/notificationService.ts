import { api } from "./api";
import {
    Notification,
    NotificationSettings,
    NotificationFilters,
    NotificationStats
} from "../types/notification";

export class NotificationService {
    static async getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
        const params = new URLSearchParams();
        if (filters?.unread_only) {
            params.append("unread_only", "true");
        }
        if (filters?.type) {
            params.append("type", filters.type);
        }
        if (filters?.startDate) {
            params.append("start_date", filters.startDate.toISOString());
        }
        if (filters?.endDate) {
            params.append("end_date", filters.endDate.toISOString());
        }

        const response = await api.get(`/api/notifications?${params.toString()}`);
        return response.data;
    }

    static async markAsRead(notificationId: number): Promise<void> {
        await api.post(`/api/notifications/${notificationId}/read`);
    }

    static async markAllAsRead(): Promise<void> {
        await api.post("/api/notifications/read-all");
    }

    static async deleteNotification(notificationId: number): Promise<void> {
        await api.delete(`/api/notifications/${notificationId}`);
    }

    static async getNotificationSettings(): Promise<NotificationSettings> {
        const response = await api.get("/api/notifications/settings");
        return response.data;
    }

    static async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
        const response = await api.post("/api/notifications/settings", settings);
        return response.data;
    }

    static async getNotificationStats(): Promise<NotificationStats> {
        const response = await api.get("/api/notifications/stats");
        return response.data;
    }
}
