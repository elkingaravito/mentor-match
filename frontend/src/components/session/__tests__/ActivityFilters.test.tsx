import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { ActivityFilters } from '../ActivityFilters';

const theme = createTheme();

describe('ActivityFilters', () => {
    const mockOnFiltersChange = jest.fn();
    const defaultProps = {
        filters: {
            search: '',
            types: [],
            status: null,
            tags: [],
            dateRange: null
        },
        onFiltersChange: mockOnFiltersChange,
        availableTags: ['react', 'typescript', 'testing']
    };

    const renderWithTheme = (props = defaultProps) => {
        return render(
            <ThemeProvider theme={theme}>
                <ActivityFilters {...props} />
            </ThemeProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders search input correctly', () => {
        renderWithTheme();
        expect(screen.getByPlaceholderText('Search activities...')).toBeInTheDocument();
    });

    it('handles search input change', () => {
        renderWithTheme();
        const input = screen.getByPlaceholderText('Search activities...');
        fireEvent.change(input, { target: { value: 'test' } });
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
            ...defaultProps.filters,
            search: 'test'
        });
    });

    it('displays type filters when filter button is clicked', () => {
        renderWithTheme();
        fireEvent.click(screen.getByTitle('Filters'));
        expect(screen.getByText('Activity Types')).toBeInTheDocument();
        expect(screen.getByText('Code Snippets')).toBeInTheDocument();
        expect(screen.getByText('Questions')).toBeInTheDocument();
    });

    it('displays active filters as chips', () => {
        renderWithTheme({
            ...defaultProps,
            filters: {
                ...defaultProps.filters,
                types: ['code'],
                tags: ['react']
            }
        });
        expect(screen.getByText('Code Snippets')).toBeInTheDocument();
        expect(screen.getByText('react')).toBeInTheDocument();
    });

    it('handles filter clear', () => {
        renderWithTheme({
            ...defaultProps,
            filters: {
                ...defaultProps.filters,
                types: ['code'],
                tags: ['react']
            }
        });
        fireEvent.click(screen.getByText('Clear all'));
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
            search: '',
            types: [],
            status: null,
            tags: [],
            dateRange: null
        });
    });
});