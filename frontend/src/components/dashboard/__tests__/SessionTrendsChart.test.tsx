import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupApiStore } from '../../../utils/test-utils';
import { apiSlice } from '../../../services/api';
import { SessionTrendsChart } from '../SessionTrendsChart';

const mockTrends = {
    data: {
        by_day: [
            { day: "2024-02-28", count: 5 },
            { day: "2024-02-29", count: 3 }
        ],
        by_status: [
            { status: "completed", count: 120 },
            { status: "cancelled", count: 20 }
        ],
        by_hour: [
            { hour: 9, count: 15 },
            { hour: 10, count: 20 }
        ],
        completion_rate: 80
    },
    status: 200
};

describe('SessionTrendsChart', () => {
    const storeRef = setupApiStore(apiSlice);

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('renders loading state correctly', () => {
        fetchMock.mockResponseOnce(() => new Promise(() => {})); // Never resolves

        render(
            <Provider store={storeRef.store}>
                <SessionTrendsChart />
            </Provider>
        );

        expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('renders chart with data correctly', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockTrends));

        render(
            <Provider store={storeRef.store}>
                <SessionTrendsChart />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Session Trends')).toBeInTheDocument();
            expect(screen.getByText('Sessions')).toBeInTheDocument();
            expect(screen.getByText('Completion Rate (%)')).toBeInTheDocument();
        });
    });

    it('handles period change correctly', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockTrends));

        render(
            <Provider store={storeRef.store}>
                <SessionTrendsChart />
            </Provider>
        );

        const periodSelect = screen.getByLabelText('Period');
        fireEvent.mouseDown(periodSelect);
        
        const option = screen.getByText('Last 7 days');
        fireEvent.click(option);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('days=7'),
                expect.any(Object)
            );
        });
    });

    it('handles error state correctly', async () => {
        const errorMessage = 'Failed to fetch trends';
        fetchMock.mockRejectOnce(new Error(errorMessage));

        render(
            <Provider store={storeRef.store}>
                <SessionTrendsChart />
            </Provider>
        );

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
        
        const refreshButton = screen.getByRole('button');
        fireEvent.click(refreshButton);
        
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});