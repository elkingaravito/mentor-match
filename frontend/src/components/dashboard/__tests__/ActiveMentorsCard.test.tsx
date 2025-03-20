import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import { setupApiStore } from '../../../utils/test-utils';
import { apiSlice } from '../../../services/api';
import { presenceApi } from '../../../services/presence';
import { ActiveMentorsCard } from '../ActiveMentorsCard';

const theme = createTheme();

const mockActiveMentors = {
    data: [
        {
            id: 1,
            name: "John Doe",
            currentSession: {
                id: 1,
                startTime: "2024-02-29T10:00:00Z",
                endTime: "2024-02-29T11:00:00Z",
                menteeId: 2,
                menteeName: "Jane Smith",
                topic: "React Hooks"
            },
            availability: {
                nextSlot: "2024-02-29T13:00:00Z",
                totalHoursToday: 4
            }
        },
        {
            id: 2,
            name: "Alice Johnson",
            availability: {
                nextSlot: "2024-02-29T11:00:00Z",
                totalHoursToday: 6
            }
        }
    ],
    status: 200
};

const mockPresence = {
    data: [
        {
            userId: 1,
            status: 'busy',
            lastSeen: new Date().toISOString(),
            currentActivity: {
                type: 'session',
                details: 'Mentoring session'
            }
        },
        {
            userId: 2,
            status: 'online',
            lastSeen: new Date().toISOString()
        }
    ],
    status: 200
};

describe('ActiveMentorsCard', () => {
    const storeRef = setupApiStore(apiSlice, {
        [presenceApi.reducerPath]: presenceApi.reducer
    });

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <Provider store={storeRef.store}>
                <ThemeProvider theme={theme}>
                    {component}
                </ThemeProvider>
            </Provider>
        );
    };

    it('renders loading state correctly', () => {
        fetchMock.mockResponseOnce(() => new Promise(() => {}));

        renderWithProviders(<ActiveMentorsCard />);

        expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
    });

    it('renders active mentors correctly', async () => {
        fetchMock
            .mockResponseOnce(JSON.stringify(mockActiveMentors))
            .mockResponseOnce(JSON.stringify(mockPresence));

        renderWithProviders(<ActiveMentorsCard />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
            expect(screen.getByText('In session: React Hooks')).toBeInTheDocument();
        });
    });

    it('displays correct availability information', async () => {
        fetchMock
            .mockResponseOnce(JSON.stringify(mockActiveMentors))
            .mockResponseOnce(JSON.stringify(mockPresence));

        renderWithProviders(<ActiveMentorsCard />);

        await waitFor(() => {
            expect(screen.getByText('Hours today: 4')).toBeInTheDocument();
            expect(screen.getByText('Hours today: 6')).toBeInTheDocument();
        });
    });

    it('handles error state correctly', async () => {
        const errorMessage = 'Failed to fetch active mentors';
        fetchMock.mockRejectOnce(new Error(errorMessage));

        renderWithProviders(<ActiveMentorsCard />);

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
        
        const refreshButton = screen.getByRole('button');
        fireEvent.click(refreshButton);
        
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});