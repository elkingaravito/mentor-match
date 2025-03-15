import { useState, useEffect } from 'react';
import { MentorMatch, UserProfile } from '../types/matching';

interface UseMatchRecommendationsProps {
    currentUser: UserProfile;
    availableMentors?: UserProfile[];
}

interface UseMatchRecommendationsReturn {
    matches: MentorMatch[];
    isLoading: boolean;
    error: Error | null;
    refreshMatches: () => void;
}

const calculateMatchScore = (mentee: UserProfile, mentor: UserProfile) => {
    // Calculate expertise match
    const expertiseMatch = mentee.expertise.reduce((score, menteeExp) => {
        const mentorExp = mentor.expertise.find(exp => exp.name === menteeExp.name);
        if (mentorExp && mentorExp.level !== 'beginner') {
            return score + 1;
        }
        return score;
    }, 0) / mentee.expertise.length;

    // Calculate availability match
    const availabilityMatch = mentor.availability.some(mentorSlot =>
        mentee.availability.some(menteeSlot =>
            mentorSlot.dayOfWeek === menteeSlot.dayOfWeek &&
            mentorSlot.startTime <= menteeSlot.endTime &&
            mentorSlot.endTime >= menteeSlot.startTime
        )
    ) ? 1 : 0;

    // Calculate overall score
    const overallFit = (expertiseMatch * 0.7) + (availabilityMatch * 0.3);

    return {
        score: overallFit,
        compatibilityFactors: {
            expertiseMatch,
            availabilityMatch,
            overallFit
        }
    };
};

export const useMatchRecommendations = ({
    currentUser,
    availableMentors = []
}: UseMatchRecommendationsProps): UseMatchRecommendationsReturn => {
    const [matches, setMatches] = useState<MentorMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const generateMatches = () => {
        try {
            const newMatches = availableMentors
                .map(mentor => ({
                    mentor,
                    mentee: currentUser,
                    matchScore: calculateMatchScore(currentUser, mentor),
                    availableSlots: mentor.availability.filter(mentorSlot =>
                        currentUser.availability.some(menteeSlot =>
                            mentorSlot.dayOfWeek === menteeSlot.dayOfWeek &&
                            mentorSlot.startTime <= menteeSlot.endTime &&
                            mentorSlot.endTime >= menteeSlot.startTime
                        )
                    )
                }))
                .sort((a, b) => b.matchScore.score - a.matchScore.score);

            setMatches(newMatches);
            setIsLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to generate matches'));
            setIsLoading(false);
        }
    };

    useEffect(() => {
        generateMatches();
    }, [currentUser, availableMentors]);

    return {
        matches,
        isLoading,
        error,
        refreshMatches: generateMatches
    };
};