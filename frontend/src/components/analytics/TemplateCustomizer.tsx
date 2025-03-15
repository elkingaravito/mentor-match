import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Paper,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Slider,
    Switch,
    FormControlLabel,
    Button,
    Tooltip,
    Stack
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    DragIndicator as DragIndicatorIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    ColorLens as ColorLensIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ChromePicker } from 'react-color';

interface TemplateCustomizerProps {
    template: any;
    onTemplateChange: (template: any) => void;
    availableColumns: string[];
    onPreviewRefresh: () => void;
}

export const TemplateCustomizer: React.FC<TemplateCustomizerProps> = ({
    template,
    onTemplateChange,
    availableColumns,
    onPreviewRefresh
}) => {
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('columns');

    const handleColorChange = (color: any) => {
        const newTemplate = {
            ...template,
            styling: {
                ...template.styling,
                headerColor: color.hex
            }
        };
        onTemplateChange(newTemplate);
    };

    const handleColumnReorder = (result: any) => {
        if (!result.destination) return;

        const columns = Array.from(template.columns);
        const [reorderedColumn] = columns.splice(result.source.index, 1);
        columns.splice(result.destination.index, 0, reorderedColumn);

        onTemplateChange({
            ...template,
            columns
        });
    };

    const handleColumnToggle = (column: string) => {
        const columns = template.columns || [];
        const newColumns = columns.includes(column)
            ? columns.filter((c: string) => c !== column)
            : [...columns, column];

        onTemplateChange({
            ...template,
            columns: newColumns
        });
    };

    const handleStyleChange = (property: string, value: any) => {
        onTemplateChange({
            ...template,
            styling: {
                ...template.styling,
                [property]: value
            }
        });
    };

    return (
        <Box>
            <Accordion
                expanded={activeSection === 'columns'}
                onChange={() => setActiveSection(activeSection === 'columns' ? '' : 'columns')}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Columns & Layout</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box mb={2}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Selected Columns
                        </Typography>
                        <DragDropContext onDragEnd={handleColumnReorder}>
                            <Droppable droppableId="columns">
                                {(provided) => (
                                    <Paper
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        variant="outlined"
                                        sx={{ p: 2, minHeight: 100 }}
                                    >
                                        {template.columns?.map((column: string, index: number) => (
                                            <Draggable
                                                key={column}
                                                draggableId={column}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <Box
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        sx={{ mb: 1 }}
                                                    >
                                                        <Chip
                                                            label={column}
                                                            onDelete={() => handleColumnToggle(column)}
                                                            icon={<DragIndicatorIcon />}
                                                        />
                                                    </Box>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </Paper>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Available Columns
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {availableColumns.map((column) => (
                                <Chip
                                    key={column}
                                    label={column}
                                    onClick={() => handleColumnToggle(column)}
                                    variant={template.columns?.includes(column) ? "filled" : "outlined"}
                                />
                            ))}
                        </Stack>
                    </Box>
                </AccordionDetails>
            </Accordion>

            <Accordion
                expanded={activeSection === 'styling'}
                onChange={() => setActiveSection(activeSection === 'styling' ? '' : 'styling')}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Styling Options</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center">
                                <Typography variant="body2" sx={{ mr: 2 }}>
                                    Header Color
                                </Typography>
                                <Button
                                    onClick={() => setColorPickerOpen(!colorPickerOpen)}
                                    variant="outlined"
                                    size="small"
                                    startIcon={<ColorLensIcon />}
                                    style={{
                                        backgroundColor: template.styling?.headerColor || '#4B0082',
                                        color: 'white'
                                    }}
                                >
                                    {template.styling?.headerColor || '#4B0082'}
                                </Button>
                            </Box>
                            {colorPickerOpen && (
                                <Box position="absolute" zIndex="tooltip">
                                    <Paper elevation={3}>
                                        <ChromePicker
                                            color={template.styling?.headerColor || '#4B0082'}
                                            onChange={handleColorChange}
                                        />
                                    </Paper>
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Font Family</InputLabel>
                                <Select
                                    value={template.styling?.fontFamily || 'Arial'}
                                    onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                                    label="Font Family"
                                >
                                    <MenuItem value="Arial">Arial</MenuItem>
                                    <MenuItem value="Helvetica">Helvetica</MenuItem>
                                    <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                                    <MenuItem value="Courier">Courier</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography gutterBottom>Font Size</Typography>
                            <Slider
                                value={template.styling?.fontSize || 12}
                                onChange={(_, value) => handleStyleChange('fontSize', value)}
                                min={8}
                                max={16}
                                step={1}
                                marks
                                valueLabelDisplay="auto"
                            />
                        </Grid>
                        {template.format === 'excel' && (
                            <>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={template.styling?.alternateRows || false}
                                                onChange={(e) => handleStyleChange('alternateRows', e.target.checked)}
                                            />
                                        }
                                        label="Alternate Row Colors"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={template.styling?.boldHeaders || true}
                                                onChange={(e) => handleStyleChange('boldHeaders', e.target.checked)}
                                            />
                                        }
                                        label="Bold Headers"
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </AccordionDetails>
            </Accordion>

            <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                    variant="contained"
                    onClick={onPreviewRefresh}
                >
                    Update Preview
                </Button>
            </Box>
        </Box>
    );
};