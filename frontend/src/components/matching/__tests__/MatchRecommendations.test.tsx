import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MatchRecommendations from '../MatchRecommendations';
import { MentorMatch, UserProfile, Expertise, Availability } from '../../../types/matching';

const mockExpertise: Expertise[] = [
    { id: '1', name: 'React', level: 'expert' },
    { id: '2', name: 'TypeScript', level: 'intermediate' }
];

const mockAvailability: Availability[] = [
    {
        id: '1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        timeZone: 'UTC'
    }
];

const mockMentor: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'mentor',
    expertise: mockExpertise,
    availability: mockAvailability,
    bio: 'Experienced developer',
    profilePicture: 'https://example.com/photo.jpg'
};

const mockMentee: UserProfile = {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'mentee',
    expertise: mockExpertise,
    availability: mockAvailability,
    bio: 'Aspiring developer'
};

const mockMatch: MentorMatch = {
    mentor: mockMentor,
    mentee: mockMentee,
    matchScore: {
        score: 0.85,
        compatibilityFactors: {
            expertiseMatch: 0.9,
            availabilityMatch: 0.8,
            overallFit: 0.85
        }
    },
    availableSlots: mockAvailability
};

describe('MatchRecommendations', () => {
    const mockOnMatchSelect = jest.fn();
    const mockOnScheduleMeeting = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state correctly', () => {
        render(
            <MatchRecommendations
                mentorMatches={[]}
                isLoading={true}
                onMatchSelect={mockOnMatchSelect}
                onScheduleMeeting={mockOnScheduleMeeting}
            />
        );

        expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
    });

    it('renders empty state when no matches', () => {
        render(
            <MatchRecommendations
                mentorMatches={[]}
                isLoading={false}
                onMatchSelect={mockOnMatchSelect}
                onScheduleMeeting={mockOnScheduleMeeting}
            />
        );

        expect(screen.getByText('No mentor matches found')).toBeInTheDocument();
    });

    it('renders mentor matches correctly', () => {
        render(
            <MatchRecommendations
                mentorMatches={[mockMatch]}
                isLoading={false}
                onMatchSelect={mockOnMatchSelect}
                onScheduleMeeting={mockOnScheduleMeeting}
            />
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('85% Match')).toBeInTheDocument();
        expect(screen.getByText('React (expert)')).toBeInTheDocument();
    });

    it('calls onMatchSelect when View Profile is clicked', () => {
        render(
            <MatchRecommendations
                mentorMatches={[mockMatch]}
                isLoading={false}
                onMatchSelect={mockOnMatchSelect}
                onScheduleMeeting={mockOnScheduleMeeting}
            />
        );

        fireEvent.click(screen.getByText('View Profile'));
        expect(mockOnMatchSelect).toHaveBeenCalledWith(mockMatch);
    });
});