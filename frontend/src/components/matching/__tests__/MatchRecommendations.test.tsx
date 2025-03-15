import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MatchRecommendations } from '../MatchRecommendations';
import { AuthProvider } from '../../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { server } from '../../../mocks/server';
import { rest } from 'msw';

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
);

describe('MatchRecommendations', () => {
    it('should render loading state', () => {
        render(<MatchRecommendations />, { wrapper });
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render match suggestions', async () => {
        render(<MatchRecommendations />, { wrapper });

        await waitFor(() => {
            expect(screen.getByText('Match Score: 85.0%')).toBeInTheDocument();
        });

        expect(screen.getByText('Python')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('should handle accept match', async () => {
        render(<MatchRecommendations />, { wrapper });

        await waitFor(() => {
            expect(screen.getByText('Accept')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Accept'));

        await waitFor(() => {
            // Verify that the accept API was called
            // This could be done by checking if the component re-renders with updated data
            expect(screen.queryByText('Match Score: 85.0%')).not.toBeInTheDocument();
        });
    });

    it('should handle reject match', async () => {
        render(<MatchRecommendations />, { wrapper });

        await waitFor(() => {
            expect(screen.getByText('Decline')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Decline'));

        await waitFor(() => {
            // Verify that the reject API was called
            expect(screen.queryByText('Match Score: 85.0%')).not.toBeInTheDocument();
        });
    });

    it('should handle error state', async () => {
        server.use(
            rest.get('*/api/matching/suggestions', (req, res, ctx) => {
                return res(ctx.status(500), ctx.json({ message: 'Server error' }));
            })
        );

        render(<MatchRecommendations />, { wrapper });

        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });

    it('should handle empty suggestions', async () => {
        server.use(
            rest.get('*/api/matching/suggestions', (req, res, ctx) => {
                return res(ctx.json([]));
            })
        );

        render(<MatchRecommendations />, { wrapper });

        await waitFor(() => {
            expect(screen.getByText('No matching suggestions available at the moment.')).toBeInTheDocument();
        });
    });
});
