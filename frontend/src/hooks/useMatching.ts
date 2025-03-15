import { useState, useCallback } from "react";
import { MatchingService } from "../services/matchingService";
import { MatchScore, MatchPreference, MatchFeedback } from "../types/matching";
import { useAuth } from "../context/AuthContext";

export const useMatching = () => {
    const [suggestions, setSuggestions] = useState<MatchScore[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const loadSuggestions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await MatchingService.getSuggestions();
            setSuggestions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading suggestions");
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePreferences = useCallback(async (preferences: Partial<MatchPreference>) => {
        try {
            setLoading(true);
            setError(null);
            await MatchingService.updatePreferences(preferences);
            await loadSuggestions(); // Reload suggestions after updating preferences
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating preferences");
        } finally {
            setLoading(false);
        }
    }, [loadSuggestions]);

    const acceptMatch = useCallback(async (matchId: number) => {
        try {
            setLoading(true);
            setError(null);
            await MatchingService.acceptMatch(matchId);
            await loadSuggestions(); // Reload suggestions after accepting match
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error accepting match");
        } finally {
            setLoading(false);
        }
    }, [loadSuggestions]);

    const rejectMatch = useCallback(async (matchId: number) => {
        try {
            setLoading(true);
            setError(null);
            await MatchingService.rejectMatch(matchId);
            await loadSuggestions(); // Reload suggestions after rejecting match
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error rejecting match");
        } finally {
            setLoading(false);
        }
    }, [loadSuggestions]);

    const provideFeedback = useCallback(async (matchId: number, feedback: MatchFeedback) => {
        try {
            setLoading(true);
            setError(null);
            await MatchingService.provideFeedback(matchId, feedback);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error providing feedback");
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        suggestions,
        loading,
        error,
        loadSuggestions,
        updatePreferences,
        acceptMatch,
        rejectMatch,
        provideFeedback,
        isMentor: user?.role === "mentor",
        isMentee: user?.role === "mentee"
    };
};
