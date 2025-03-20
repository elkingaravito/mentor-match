import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import { setupApiStore } from '../../../utils/test-utils';
import { apiSlice } from '../../../services/api';
import { PopularSkillsCard } from '../PopularSkillsCard';

const theme = createTheme();

const mockSkills = {
    data: [
        {
            id: 1,
            name: "React",
            category: "Technical",
            interest_count: 50
        },
        {
            id: 2,
            name: "Communication",
            category: "Soft Skills",
            interest_count: 45
        },
        {
            id: 3,
            name: "Machine Learning",
            category: "Technical",
            interest_count: 40
        },
        {
            id: 4,
            name: "Project Management",
            category: "Leadership",
            interest_count: 35
        },
        {
            id: 5,
            name: "Healthcare IT",
            category: "Domain",
            interest_count: 30
        }
    ],
    status: 200
};

describe('PopularSkillsCard', () => {
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

        renderWithProviders(<PopularSkillsCard />);

        expect(screen.getAllByTestId('skeleton')).toHaveLength(5);
    });

    it('renders skills data correctly', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockSkills));

        renderWithProviders(<PopularSkillsCard />);

        await waitFor(() => {
            expect(screen.getByText('React')).toBeInTheDocument();
            expect(screen.getByText('50')).toBeInTheDocument();
        });
    });

    it('handles tab switching correctly', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockSkills));

        renderWithProviders(<PopularSkillsCard />);

        await waitFor(() => {
            expect(screen.getByText('React')).toBeInTheDocument();
        });

        // Switch to Soft Skills tab
        fireEvent.click(screen.getByText('Soft Skills'));
        expect(screen.getByText('Communication')).toBeInTheDocument();

        // Switch to Leadership tab
        fireEvent.click(screen.getByText('Leadership'));
        expect(screen.getByText('Project Management')).toBeInTheDocument();
    });

    it('handles error state correctly', async () => {
        const errorMessage = 'Failed to fetch skills';
        fetchMock.mockRejectOnce(new Error(errorMessage));

        renderWithProviders(<PopularSkillsCard />);

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
        
        const refreshButton = screen.getByRole('button');
        fireEvent.click(refreshButton);
        
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('displays correct progress bars', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockSkills));

        renderWithProviders(<PopularSkillsCard />);

        await waitFor(() => {
            const progressBars = screen.getAllByRole('progressbar');
            expect(progressBars[0]).toHaveAttribute('aria-valuenow', '100'); // React (50/50 * 100)
            expect(progressBars[1]).toHaveAttribute('aria-valuenow', '80'); // Machine Learning (40/50 * 100)
        });
    });
});