import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { TemplateCustomizationDialog } from './TemplateCustomizationDialog';
import { api } from '../../services/api';

interface ExportTemplate {
    id: number;
    name: string;
    description: string;
    format: string;
    columns: string[];
    styling: {
        headerColor: string;
        fontFamily: string;
        fontSize: number;
        boldHeaders: boolean;
        alternateRows: boolean;
    };
    is_public: boolean;
    is_owner: boolean;
}

interface ExportTemplateManagerProps {
    onTemplateSelect: (template: ExportTemplate) => void;
}

export const ExportTemplateManager: React.FC<ExportTemplateManagerProps> = ({
    onTemplateSelect
}) => {
    const [templates, setTemplates] = useState<ExportTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
    const [customizationOpen, setCustomizationOpen] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await api.get('/templates');
            setTemplates(response.data);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    const handleCustomize = (template: ExportTemplate) => {
        setSelectedTemplate(template);
        setCustomizationOpen(true);
    };

    const handleCustomizationSave = async (updatedTemplate: ExportTemplate) => {
        try {
            await api.put(`/templates/${updatedTemplate.id}`, updatedTemplate);
            fetchTemplates();
        } catch (error) {
            console.error('Failed to save template customization:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                await api.delete(`/templates/${id}`);
                fetchTemplates();
            } catch (error) {
                console.error('Failed to delete template:', error);
            }
        }
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center" marginBottom={2}>
                        <Typography variant="h6">Export Templates</Typography>
                        <Button
                            variant="contained"
                            onClick={() => handleCustomize({
                                id: 0,
                                name: 'New Template',
                                description: '',
                                format: 'pdf',
                                columns: [],
                                styling: {
                                    headerColor: '#4B0082',
                                    fontFamily: 'Arial',
                                    fontSize: 12,
                                    boldHeaders: true,
                                    alternateRows: false
                                },
                                is_public: false,
                                is_owner: true
                            })}
                        >
                            Create Template
                        </Button>
                    </Grid>

                    <List>
                        {templates.map((template) => (
                            <ListItem
                                key={template.id}
                                secondaryAction={
                                    <Box>
                                        <IconButton
                                            onClick={() => handleCustomize(template)}
                                            title="Customize Template"
                                        >
                                            <ColorLensIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => onTemplateSelect(template)}
                                            title="Use Template"
                                        >
                                            <ContentCopyIcon />
                                        </IconButton>
                                        {template.is_owner && (
                                            <IconButton
                                                onClick={() => handleDelete(template.id)}
                                                title="Delete Template"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center">
                                            {template.name}
                                            {template.is_public && (
                                                <Chip
                                                    size="small"
                                                    icon={<ShareIcon />}
                                                    label="Public"
                                                    color="primary"
                                                    sx={{ ml: 1 }}
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={template.description}
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>

            <TemplateCustomizationDialog
                open={customizationOpen}
                template={selectedTemplate}
                onClose={() => {
                    setCustomizationOpen(false);
                    setSelectedTemplate(null);
                }}
                onSave={handleCustomizationSave}
            />
        </>
    );
};