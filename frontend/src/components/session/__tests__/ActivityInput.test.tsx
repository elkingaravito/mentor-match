import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import { setupApiStore } from '../../../utils/test-utils';
import { sessionActivityApi } from '../../../services/sessionActivity';
import { ActivityInput } from '../ActivityInput';

const theme = createTheme();

describe('ActivityInput', () => {
    const storeRef = setupApiStore(sessionActivityApi);
    const mockOnActivityAdded = jest.fn();

    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <Provider store={storeRef.store}>
                <ThemeProvider theme={theme}>
                    {component}
                </ThemeProvider>
            </Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders note input correctly', () => {
        renderWithProviders(
            <ActivityInput sessionId={1} onActivityAdded={mockOnActivityAdded} />
        );

        expect(screen.getByPlaceholderText('Add a note...')).toBeInTheDocument();
    });

    it('handles note submission', async () => {
        renderWithProviders(
            <ActivityInput sessionId={1} onActivityAdded={mockOnActivityAdded} />
        );

        const input = screen.getByPlaceholderText('Add a note...');
        fireEvent.change(input, { target: { value: 'Test note' } });
        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(mockOnActivityAdded).toHaveBeenCalled();
        });
        expect(input).toHaveValue('');
    });

    it('opens code dialog when clicking code action', () => {
        renderWithProviders(
            <ActivityInput sessionId={1} onActivityAdded={mockOnActivityAdded} />
        );

        fireEvent.click(screen.getByLabelText('Add activity'));
        fireEvent.click(screen.getByTitle('Code'));

        expect(screen.getByText('Add Code Snippet')).toBeInTheDocument();
    });

    it('opens question dialog when clicking question action', () => {
        renderWithProviders(
            <ActivityInput sessionId={1} onActivityAdded={mockOnActivityAdded} />
        );

        fireEvent.click(screen.getByLabelText('Add activity'));
        fireEvent.click(screen.getByTitle('Question'));

        expect(screen.getByText('Ask a Question')).toBeInTheDocument();
    });

    it('opens resource dialog when clicking resource action', () => {
        renderWithProviders(
            <ActivityInput sessionId={1} onActivityAdded={mockOnActivityAdded} />
        );

        fireEvent.click(screen.getByLabelText('Add activity'));
        fireEvent.click(screen.getByTitle('Resource'));

        expect(screen.getByText('Share Resource')).toBeInTheDocument();
    });
});