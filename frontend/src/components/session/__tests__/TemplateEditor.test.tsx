import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { TemplateEditor } from '../TemplateEditor';
import { ExportTemplate } from '../../../services/templateService';

const theme = createTheme();

describe('TemplateEditor', () => {
    const mockTemplate: ExportTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'Test Description',
        format: 'json',
        sections: [
            {
                type: 'activities',
                title: 'Activities',
                fields: ['timestamp', 'type', 'content'],
                format: { layout: 'table' }
            }
        ],
        transformations: [
            {
                type: 'sort',
                field: 'timestamp',
                operation: 'desc'
            }
        ],
        metadata: {
            author: 'Test Author',
            version: '1.0.0',
            tags: ['test'],
            lastModified: new Date().toISOString()
        }
    };

    const mockOnSave = jest.fn();
    const mockOnClose = jest.fn();

    const renderWithTheme = (props = {}) => {
        return render(
            <ThemeProvider theme={theme}>
                <TemplateEditor
                    open={true}
                    onClose={mockOnClose}
                    onSave={mockOnSave}
                    {...props}
                />
            </ThemeProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders template editor with empty state', () => {
        renderWithTheme();
        expect(screen.getByText('Create New Template')).toBeInTheDocument();
        expect(screen.getByLabelText('Template Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Format')).toBeInTheDocument();
    });

    it('renders template editor with existing template', () => {
        renderWithTheme({ template: mockTemplate });
        expect(screen.getByText('Edit Template')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Template')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    });

    it('handles section addition', () => {
        renderWithTheme();
        fireEvent.click(screen.getByText('Add Section'));
        expect(screen.getByText('New Section')).toBeInTheDocument();
    });

    it('handles section deletion', () => {
        renderWithTheme({ template: mockTemplate });
        const deleteButton = screen.getAllByTestId('delete-section')[0];
        fireEvent.click(deleteButton);
        expect(screen.queryByText('Activities')).not.toBeInTheDocument();
    });

    it('handles transformation addition', async () => {
        renderWithTheme();
        fireEvent.click(screen.getByText('Transformations'));
        fireEvent.click(screen.getByText('Add Transformation'));
        expect(screen.getByLabelText('Type')).toBeInTheDocument();
    });

    it('saves template correctly', async () => {
        renderWithTheme({ template: mockTemplate });
        fireEvent.click(screen.getByText('Save Template'));
        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            id: 'test-template',
            name: 'Test Template'
        }));
    });

    it('validates required fields before saving', () => {
        renderWithTheme();
        const saveButton = screen.getByText('Save Template');
        expect(saveButton).toBeDisabled();
        
        fireEvent.change(screen.getByLabelText('Template Name'), {
            target: { value: 'New Template' }
        });
        expect(saveButton).not.toBeDisabled();
    });

    it('handles preview tab correctly', () => {
        renderWithTheme({ template: mockTemplate });
        fireEvent.click(screen.getByText('Preview'));
        expect(screen.getByText(/"name": "Test Template"/)).toBeInTheDocument();
    });
});