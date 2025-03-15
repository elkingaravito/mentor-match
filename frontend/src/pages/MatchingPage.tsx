import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import MatchRecommendations from '../components/matching/MatchRecommendations';
import { useMatchRecommendations } from '../hooks/useMatchRecommendations';

// Mock data for demonstration
const currentUser = {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'mentee' as const,
    expertise: [
        { id: '1', name: 'React', level: 'beginner' as const },
        { id: '2', name: 'TypeScript', level: 'beginner' as const }
    ],
    availability: [
        {
            id: '1',
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '17:00',
            timeZone: 'UTC'
        }
    ],
    bio: 'Aspiring developer looking to learn React and TypeScript'
};

const availableMentors = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'mentor' as const,
        expertise: [
            { id: '1', name: 'React', level: 'expert' as const },
            { id: '2', name: 'TypeScript', level: 'intermediate' as const }
        ],
        availability: [
            {
                id: '1',
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '17:00',
                timeZone: 'UTC'
            }
        ],
        bio: 'Senior developer with 5 years of React experience',
        profilePicture: 'https://example.com/john.jpg'
    },
    // Add more mock mentors here
];

const MatchingPage: React.FC = () => {
    const { matches, isLoading, error } = useMatchRecommendations({
        currentUser,
        availableMentors
    });

    const handleMatchSelect = (match: any) => {
        console.log('Selected match:', match);
        // Implement navigation to mentor profile or scheduling
    };

    const handleScheduleMeeting = (match: any, slot: any) => {
        console.log('Schedule meeting:', { match, slot });
        // Implement meeting scheduling logic
    };

    if (error) {
        return (
            <Container>
                <Typography color="error">
                    Error loading matches: {error.message}
                </Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Box py={4}>
                <Typography variant="h4" gutterBottom>
                    Find Your Mentor
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Based on your profile and preferences, here are your recommended mentors
                </Typography>
                
                <MatchRecommendations
                    mentorMatches={matches}
                    isLoading={isLoading}
                    onMatchSelect={handleMatchSelect}
                    onScheduleMeeting={handleScheduleMeeting}
                />
            </Box>
        </Container>
    );
};

export default MatchingPage;