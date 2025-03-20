import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { PresenceIndicator } from '../PresenceIndicator';

const theme = createTheme();

describe('PresenceIndicator', () => {
    const mockPresence = {
        userId: 1,
        status: 'online' as const,
        lastSeen: new Date().toISOString(),
        currentActivity: {
            type: 'session' as const,
            details: 'Mentoring session'
        }
    };

    const renderWithTheme = (component: React.ReactElement) => {
        return render(
            <ThemeProvider theme={theme}>
                {component}
            </ThemeProvider>
        );
    };

    it('renders with avatar', () => {
        renderWithTheme(
            <PresenceIndicator presence={mockPresence} showAvatar={true} />
        );
        
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders without avatar', () => {
        renderWithTheme(
            <PresenceIndicator presence={mockPresence} showAvatar={false} />
        );
        
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('shows correct status color', () => {
        const { container } = renderWithTheme(
            <PresenceIndicator presence={mockPresence} showAvatar={false} />
        );
        
        const statusDot = container.firstChild?.firstChild;
        expect(statusDot).toHaveStyle({ backgroundColor: '#44b700' });
    });

    it('shows correct tooltip content', () => {
        renderWithTheme(
            <PresenceIndicator presence={mockPresence} />
        );
        
        expect(screen.getByTitle('Online - session Mentoring session')).toBeInTheDocument();
    });
});