import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Tabs,
    Tab,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Autocomplete,
    Switch,
    FormControlLabel,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIcon,
    Save as SaveIcon,
    Preview as PreviewIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ExportTemplate, TemplateSection, DataTransformation } from '../../services/templateService';

interface TemplateEditorProps {
    open: boolean;
    onClose: () => void;
    onSave: (template: ExportTemplate) => void;
    template?: ExportTemplate;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <Box
        role="tabpanel"
        hidden={value !== index}
        sx={{ py: 2 }}
    >
        {value === index && children}
    </Box>
);

const AVAILABLE_FIELDS = {
    activities: [
        'timestamp',
        'type',
        'content',
        'userId',
        'metadata.status',
        'metadata.tags'
    ],
    metrics: [
        'totalActivities',
        'resolutionRate',
        'averageResponseTime',
        'participationMetrics.interactionRatio'
    ],
    custom: [
        'objectives',
        'outcomes',
        'nextSteps',
        'notes'
    ]
};

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
    open,
    onClose,
    onSave,
    template
}) => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [editedTemplate, setEditedTemplate] = useState<ExportTemplate>({
        id: template?.id || crypto.randomUUID(),
        name: template?.name || '',
        description: template?.description || '',
        format: template?.format || 'json',
        sections: template?.sections || [],
        transformations: template?.transformations || [],
        metadata: template?.metadata || {
            author: '',
            version: '1.0.0',
            tags: [],
            lastModified: new Date().toISOString()
        }
    });

    const handleAddSection = () => {
        setEditedTemplate(prev => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    type: 'activities',
                    title: 'New Section',
                    fields: [],
                    format: {
                        layout: 'table'
                    }
                }
            ]
        }));
    };

    const handleSectionChange = (index: number, updates: Partial<TemplateSection>) => {
        setEditedTemplate(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === index ? { ...section, ...updates } : section
            )
        }));
    };

    const handleDeleteSection = (index: number) => {
        setEditedTemplate(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const sections = Array.from(editedTemplate.sections);
        const [removed] = sections.splice(result.source.index, 1);
        sections.splice(result.destination.index, 0, removed);

        setEditedTemplate(prev => ({
            ...prev,
            sections
        }));
    };

    const handleAddTransformation = () => {
        setEditedTemplate(prev => ({
            ...prev,
            transformations: [
                ...prev.transformations,
                {
                    type: 'filter',
                    operation: 'equals',
                    options: {}
                }
            ]
        }));
    };

    const handleTransformationChange = (index: number, updates: Partial<DataTransformation>) => {
        setEditedTemplate(prev => ({
            ...prev,
            transformations: prev.transformations.map((transform, i) =>
                i === index ? { ...transform, ...updates } : transform
            )
        }));
    };

    const handleSave = () => {
        setEditedTemplate(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                lastModified: new Date().toISOString()
            }
        }));
        onSave(editedTemplate);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                {template ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Template Name"
                            value={editedTemplate.name}
                            onChange={(e) => setEditedTemplate(prev => ({
                                ...prev,
                                name: e.target.value
                            }))}
                            fullWidth
                        />
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Format</InputLabel>
                            <Select
                                value={editedTemplate.format}
                                onChange={(e) => setEditedTemplate(prev => ({
                                    ...prev,
                                    format: e.target.value as ExportTemplate['format']
                                }))}
                                label="Format"
                            >
                                <MenuItem value="json">JSON</MenuItem>
                                <MenuItem value="csv">CSV</MenuItem>
                                <MenuItem value="markdown">Markdown</MenuItem>
                                <MenuItem value="pdf">PDF</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <TextField
                        label="Description"
                        value={editedTemplate.description}
                        onChange={(e) => setEditedTemplate(prev => ({
                            ...prev,
                            description: e.target.value
                        }))}
                        multiline
                        rows={2}
                    />

                    <Autocomplete
                        multiple
                        options={[]}
                        freeSolo
                        value={editedTemplate.metadata?.tags || []}
                        onChange={(_, newValue) => setEditedTemplate(prev => ({
                            ...prev,
                            metadata: {
                                ...prev.metadata,
                                tags: newValue
                            }
                        }))}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tags"
                                placeholder="Add tags"
                            />
                        )}
                    />

                    <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                        <Tab label="Sections" />
                        <Tab label="Transformations" />
                        <Tab label="Preview" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="sections">
                                {(provided) => (
                                    <List {...provided.droppableProps} ref={provided.innerRef}>
                                        {editedTemplate.sections.map((section, index) => (
                                            <Draggable
                                                key={index}
                                                draggableId={`section-${index}`}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <ListItem
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        sx={{
                                                            border: 1,
                                                            borderColor: 'divider',
                                                            borderRadius: 1,
                                                            mb: 2
                                                        }}
                                                    >
                                                        <Box
                                                            {...provided.dragHandleProps}
                                                            sx={{ mr: 2 }}
                                                        >
                                                            <DragIcon />
                                                        </Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                                <TextField
                                                                    label="Section Title"
                                                                    value={section.title || ''}
                                                                    onChange={(e) => handleSectionChange(
                                                                        index,
                                                                        { title: e.target.value }
                                                                    )}
                                                                    size="small"
                                                                />
                                                                <FormControl size="small">
                                                                    <InputLabel>Type</InputLabel>
                                                                    <Select
                                                                        value={section.type}
                                                                        onChange={(e) => handleSectionChange(
                                                                            index,
                                                                            { type: e.target.value as TemplateSection['type'] }
                                                                        )}
                                                                        label="Type"
                                                                    >
                                                                        <MenuItem value="activities">Activities</MenuItem>
                                                                        <MenuItem value="metrics">Metrics</MenuItem>
                                                                        <MenuItem value="summary">Summary</MenuItem>
                                                                        <MenuItem value="custom">Custom</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </Box>
                                                            <Autocomplete
                                                                multiple
                                                                options={AVAILABLE_FIELDS[section.type] || []}
                                                                value={section.fields}
                                                                onChange={(_, newValue) => handleSectionChange(
                                                                    index,
                                                                    { fields: newValue }
                                                                )}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        label="Fields"
                                                                        size="small"
                                                                    />
                                                                )}
                                                            />
                                                        </Box>
                                                        <IconButton
                                                            onClick={() => handleDeleteSection(index)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </ListItem>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </List>
                                )}
                            </Droppable>
                        </DragDropContext>
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddSection}
                            variant="outlined"
                            fullWidth
                        >
                            Add Section
                        </Button>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <List>
                            {editedTemplate.transformations.map((transformation, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        mb: 2
                                    }}
                                >
                                    <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
                                        <FormControl size="small">
                                            <InputLabel>Type</InputLabel>
                                            <Select
                                                value={transformation.type}
                                                onChange={(e) => handleTransformationChange(
                                                    index,
                                                    { type: e.target.value as DataTransformation['type'] }
                                                )}
                                                label="Type"
                                            >
                                                <MenuItem value="filter">Filter</MenuItem>
                                                <MenuItem value="sort">Sort</MenuItem>
                                                <MenuItem value="group">Group</MenuItem>
                                                <MenuItem value="aggregate">Aggregate</MenuItem>
                                                <MenuItem value="format">Format</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            label="Field"
                                            value={transformation.field || ''}
                                            onChange={(e) => handleTransformationChange(
                                                index,
                                                { field: e.target.value }
                                            )}
                                            size="small"
                                        />
                                        <TextField
                                            label="Operation"
                                            value={transformation.operation}
                                            onChange={(e) => handleTransformationChange(
                                                index,
                                                { operation: e.target.value }
                                            )}
                                            size="small"
                                        />
                                    </Box>
                                    <IconButton
                                        onClick={() => {
                                            setEditedTemplate(prev => ({
                                                ...prev,
                                                transformations: prev.transformations.filter((_, i) => i !== index)
                                            }));
                                        }}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddTransformation}
                            variant="outlined"
                            fullWidth
                        >
                            Add Transformation
                        </Button>
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Preview of how the exported data will be structured
                        </Typography>
                        <Box
                            component="pre"
                            sx={{
                                p: 2,
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                overflow: 'auto'
                            }}
                        >
                            {JSON.stringify(editedTemplate, null, 2)}
                        </Box>
                    </TabPanel>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={<SaveIcon />}
                    disabled={!editedTemplate.name}
                >
                    Save Template
                </Button>
            </DialogActions>
        </Dialog>
    );
};