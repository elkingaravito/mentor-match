import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import { setupApiStore } from '../../../utils/test-utils';
import { apiSlice } from '../../../services/api';
import { GoalsTrackerCard } from '../GoalsTrackerCard';

const theme = createTheme();

const mockGoals = {
    data: [
        {
            id: 1,
            title: "Complete 10 mentoring sessions",
            target: 10,
            completed: 5,
            deadline: "2024-06-30",
            category: "Mentoring",
            status: "in_progress"
        },
        {
            id: 2,
            title: "Learn React Advanced Patterns",
            target: 5,
            completed: 5,
            deadline: "2024-03-15",
            category: "Learning",
            status: "completed"
        },
        {
            id: 3,
            title: "Contribute to Open Source",
            target: 3,
            completed: 1,
            deadline: "2024-02-28",
            category: "Development",
            status: "overdue"
        }
    ],
    status: 200
};

describe('GoalsTrackerCard', () => {
    const storeRef = setupApiStore(apiSlice);

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

        renderWithProviders(<GoalsTrackerCard />);

        expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
    });

    it('renders goals data correctly', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockGoals));

        renderWithProviders(<GoalsTrackerCard />);

        await waitFor(() => {
            expect(screen.getByText('Complete 10 mentoring sessions')).toBeInTheDocument();
            expect(screen.getByText('Learn React Advanced Patterns')).toBeInTheDocument();
            expect(screen.getByText('Contribute to Open Source')).toBeInTheDocument();
        });
    });

    it('opens edit dialog when clicking edit button', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockGoals));

        renderWithProviders(<GoalsTrackerCard />);

        await waitFor(() => {
            expect(screen.getByText('Complete 10 mentoring sessions')).toBeInTheDocument();
        });

        const editButtons = screen.getAllByTestId('edit-button');
        fireEvent.click(editButtons[0]);

        expect(screen.getByText('Edit Goal')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Complete 10 mentoring sessions')).toBeInTheDocument();
    });

    it('opens new goal dialog when clicking add button', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockGoals));

        renderWithProviders(<GoalsTrackerCard />);

        const addButton = screen.getByText('Add Goal');
        fireEvent.click(addButton);

        expect(screen.getByText('New Goal')).toBeInTheDocument();
    });

    it('displays correct progress indicators', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockGoals));

        renderWithProviders(<GoalsTrackerCard />);

        await waitFor(() => {
            const completedGoals = screen.getByText('Completed Goals');
            expect(completedGoals).toBeInTheDocument();
            expect(screen.getByText('33%')).toBeInTheDocument(); // 1 out of 3 goals completed
        });
    });

    it('handles error state correctly', async () => {
        const errorMessage = 'Failed to fetch goals';
        fetchMock.mockRejectOnce(new Error(errorMessage));

        renderWithProviders(<GoalsTrackerCard />);

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
        
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        fireEvent.click(refreshButton);
        
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});