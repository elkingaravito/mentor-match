import { api } from "./api";
import {
    Session,
    SessionCreate,
    SessionUpdate,
    SessionFilters,
    SessionStats
} from "../types/session";

export class SessionService {
    static async getSessions(filters?: SessionFilters): Promise<Session[]> {
        const params = new URLSearchParams();
        if (filters?.startDate) {
            params.append("start_date", filters.startDate.toISOString());
        }
        if (filters?.endDate) {
            params.append("end_date", filters.endDate.toISOString());
        }
        if (filters?.status) {
            params.append("status", filters.status);
        }
        if (filters?.participantId) {
            params.append("participant_id", filters.participantId.toString());
        }
        if (filters?.role) {
            params.append("role", filters.role);
        }

        const response = await api.get(`/api/sessions?${params.toString()}`);
        return response.data;
    }

    static async createSession(session: SessionCreate): Promise<Session> {
        const response = await api.post("/api/sessions", session);
        return response.data;
    }

    static async updateSession(sessionId: number, update: SessionUpdate): Promise<Session> {
        const response = await api.put(`/api/sessions/${sessionId}`, update);
        return response.data;
    }

    static async deleteSession(sessionId: number): Promise<void> {
        await api.delete(`/api/sessions/${sessionId}`);
    }

    static async getSessionStats(): Promise<SessionStats> {
        const response = await api.get("/api/sessions/stats");
        return response.data;
    }

    static async rescheduleSession(
        sessionId: number,
        newStartTime: string,
        newEndTime: string
    ): Promise<Session> {
        const response = await api.post(`/api/sessions/${sessionId}/reschedule`, {
            start_time: newStartTime,
            end_time: newEndTime
        });
        return response.data;
    }

    static async markSessionComplete(
        sessionId: number,
        feedback?: string
    ): Promise<Session> {
        const response = await api.post(`/api/sessions/${sessionId}/complete`, {
            feedback
        });
        return response.data;
    }

    static async cancelSession(
        sessionId: number,
        reason?: string
    ): Promise<Session> {
        const response = await api.post(`/api/sessions/${sessionId}/cancel`, {
            reason
        });
        return response.data;
    }
}
