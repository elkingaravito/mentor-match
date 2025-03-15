import { api } from "./api";
import { MatchPreference, MatchScore, MatchFeedback } from "../types/matching";

export class MatchingService {
    static async createPreferences(preferences: MatchPreference) {
        const response = await api.post("/api/matching/preferences", preferences);
        return response.data;
    }

    static async updatePreferences(preferences: Partial<MatchPreference>) {
        const response = await api.put("/api/matching/preferences", preferences);
        return response.data;
    }

    static async getSuggestions() {
        const response = await api.get("/api/matching/suggestions");
        return response.data;
    }

    static async acceptMatch(matchId: number) {
        const response = await api.post(`/api/matching/accept/${matchId}`);
        return response.data;
    }

    static async rejectMatch(matchId: number) {
        const response = await api.post(`/api/matching/reject/${matchId}`);
        return response.data;
    }

    static async provideFeedback(matchId: number, feedback: MatchFeedback) {
        const response = await api.post(`/api/matching/feedback`, {
            match_id: matchId,
            ...feedback
        });
        return response.data;
    }
}
