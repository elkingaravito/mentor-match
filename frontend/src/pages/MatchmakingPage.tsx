import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, CircularProgress } from '@mui/material';
import MatchRecommendations from '../components/matching/MatchRecommendations';
import { useMatchRecommendations } from '../hooks/useMatchRecommendations'; 
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types/matching';
import { api } from '../services/api';

const MatchmakingPage: React.FC = () => {
    const { user } = useAuth();
    const [availableMentors, setAvailableMentors] = useState<UserProfile[]>([]);
    const [isLoadingMentors, setIsLoadingMentors] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { matches, isLoading: isLoadingMatches, refreshMatches } = useMatchRecommendations({
        currentUser: user as UserProfile,
        availableMentors
    });

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                setIsLoadingMentors(true);
                const response = await api.get('/api/users/mentors');
                setAvailableMentors(response.data);
            } catch (err) {
                setError('Failed to load mentors. Please try again later.');
                console.error('Error fetching mentors:', err);
            } finally {
                setIsLoadingMentors(false);
            }
        };

        fetchMentors();
    }, []);

    const handleMatchSelect = async (match: any) => {
        try {
            // Navigate to mentor profile
            window.location.href = `/profile/${match.mentor.id}`;
        } catch (err) {
            console.error('Error handling match selection:', err);
        }
    };

    const handleScheduleMeeting = async (match: any, slot: any) => {
        try {
            const response = await api.post('/api/sessions/schedule', {
                mentorId: match.mentor.id,
                menteeId: user?.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                date: slot.dayOfWeek // This should be converted to actual date
            });

            if (response.status === 201) {
                // Show success notification and redirect to calendar
                window.location.href = '/calendar';
            }
        } catch (err) {
            console.error('Error scheduling meeting:', err);
            setError('Failed to schedule meeting. Please try again.');
        }
    };

    const isLoading = isLoadingMentors || isLoadingMatches;

    if (error) {
        return (
            <Container>
                <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography color="error">
                        {error}
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container>
            <Box py={4}>
                <Typography variant="h4" gutterBottom>
                    Find Your Perfect Mentor Match
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Our matching algorithm considers your expertise, goals, and availability 
                    to recommend the most suitable mentors for you.
                </Typography>
                
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <MatchRecommendations
                        mentorMatches={matches}
                        isLoading={isLoading}
                        onMatchSelect={handleMatchSelect}
                        onScheduleMeeting={handleScheduleMeeting}
                    />
                )}
            </Box>
        </Container>
    );
};

export default MatchmakingPage;