import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupApiStore } from '../../../utils/test-utils';
import { apiSlice } from '../../../services/api';
import { TopMentorsCard } from '../TopMentorsCard';

const mockMentors = {
    data: [
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            role: "mentor",
            position: "Senior Developer",
            company: "Tech Corp",
            expertise: [
                { id: 1, name: "React", level: "expert" },
                { id: 2, name: "TypeScript", level: "expert" },
                { id: 3, name: "Node.js", level: "intermediate" }
            ],
            completed_sessions: 25,
            average_rating: 4.8,
            created_at: "2024-01-01",
            updated_at: "2024-02-28"
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "mentor",
            position: "Tech Lead",
            company: "Innovation Inc",
            expertise: [
                { id: 4, name: "Python", level: "expert" },
                { id: 5, name: "Machine Learning", level: "expert" }
            ],
            completed_sessions: 20,
            average_rating: 4.9,
            created_at: "2024-01-15",
            updated_at: "2024-02-28"
        }
    ],
    status: 200
};

describe('TopMentorsCard', () => {
    const storeRef = setupApiStore(apiSlice);

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('renders loading state correctly', () => {
        fetchMock.mockResponseOnce(() => new Promise(() => {}));

        render(
            <Provider store={storeRef.store}>
                <TopMentorsCard />
            </Provider>
        );

        expect(screen.getAllByTestId('skeleton')).toHaveLength(5);
    });

    it('renders mentors data correctly', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockMentors));

        render(
            <Provider store={storeRef.store}>
                <TopMentorsCard />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Senior Developer at Tech Corp')).toBeInTheDocument();
            expect(screen.getByText('Tech Lead at Innovation Inc')).toBeInTheDocument();
            expect(screen.getByText('25 sessions')).toBeInTheDocument();
            expect(screen.getByText('20 sessions')).toBeInTheDocument();
        });

        // Check if expertise chips are rendered
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Python')).toBeInTheDocument();
    });

    it('handles error state correctly', async () => {
        const errorMessage = 'Failed to fetch mentors';
        fetchMock.mockRejectOnce(new Error(errorMessage));

        render(
            <Provider store={storeRef.store}>
                <TopMentorsCard />
            </Provider>
        );

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
        
        const refreshButton = screen.getByRole('button');
        fireEvent.click(refreshButton);
        
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('displays correct rating', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockMentors));

        render(
            <Provider store={storeRef.store}>
                <TopMentorsCard />
            </Provider>
        );

        await waitFor(() => {
            const ratings = screen.getAllByRole('img', { name: /stars/i });
            expect(ratings).toHaveLength(2);
            expect(ratings[0]).toHaveAttribute('aria-label', '4.8 Stars');
            expect(ratings[1]).toHaveAttribute('aria-label', '4.9 Stars');
        });
    });
});