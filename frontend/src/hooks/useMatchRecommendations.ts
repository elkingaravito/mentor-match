
import { useGetMenteeMatchesQuery, useGetMentorMatchesQuery } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useMatchRecommendations = () => {
    const { user } = useAuth();
    const isMentor = user?.role === 'mentor';

    const menteeMatches = useGetMenteeMatchesQuery(undefined, {
        skip: isMentor,
    });

    const mentorMatches = useGetMentorMatchesQuery(undefined, {
        skip: !isMentor,
    });

    return {
        matches: isMentor ? mentorMatches.data : menteeMatches.data,
        isLoading: isMentor ? mentorMatches.isLoading : menteeMatches.isLoading,
        error: isMentor ? mentorMatches.error : menteeMatches.error,
        isMentor,
    };
};