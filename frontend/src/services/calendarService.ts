import { api } from "./api";
import { AvailabilitySlot } from "../types/matching";

export class CalendarService {
    static async createAvailability(availability: Omit<AvailabilitySlot, "id">) {
        const response = await api.post("/api/calendar/availability", availability);
        return response.data;
    }

    static async deleteAvailability(availabilityId: number) {
        const response = await api.delete(`/api/calendar/availability/${availabilityId}`);
        return response.data;
    }

    static async integrateCalendar(provider: string, authCode: string) {
        const response = await api.post(`/api/calendar/integrate/${provider}`, {
            auth_code: authCode
        });
        return response.data;
    }

    static async syncCalendar() {
        const response = await api.get("/api/calendar/sync");
        return response.data;
    }

    static async getUserAvailability(userId: number, startDate: Date, endDate: Date) {
        const response = await api.get(`/api/calendar/availability/${userId}`, {
            params: {
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            }
        });
        return response.data;
    }
}
