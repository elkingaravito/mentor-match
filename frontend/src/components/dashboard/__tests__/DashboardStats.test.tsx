import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupApiStore } from '../../../utils/test-utils';
import { apiSlice } from '../../../services/api';
import { DashboardStats } from '../DashboardStats';

const mockStats = {
    data: {
        user_id: 1,
        name: "Test User",
        role: "mentor",
        sessions: {
            total: 10,
            completed: 8,
            cancelled: 1,
            upcoming: 1
        },
        mentoring_hours: 16.5,
        average_rating: 4.5
    },
    status: 200
};

describe('DashboardStats', () => {
    const storeRef = setupApiStore(apiSlice);

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('renders loading state correctly', () => {
        fetchMock.mockResponseOnce(() => new Promise(() => {})); // Never resolves

        render(
            <Provider store={storeRef.store}>
                <DashboardStats />
            </Provider>
        );

        expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
    });

    it('renders statistics correctly', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockStats));

        render(
            <Provider store={storeRef.store}>
                <DashboardStats />
            </Provider>
        );

        expect(await screen.findByText('10')).toBeInTheDocument(); // Total Sessions
        expect(await screen.findByText('8')).toBeInTheDocument(); // Completed Sessions
        expect(await screen.findByText('16.5h')).toBeInTheDocument(); // Mentoring Hours
        expect(await screen.findByText('4.5')).toBeInTheDocument(); // Average Rating
    });

    it('handles error state correctly', async () => {
        const errorMessage = 'Failed to fetch statistics';
        fetchMock.mockRejectOnce(new Error(errorMessage));

        render(
            <Provider store={storeRef.store}>
                <DashboardStats />
            </Provider>
        );

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
        
        const refreshButton = screen.getByRole('button');
        fireEvent.click(refreshButton);
        
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});