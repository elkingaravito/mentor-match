import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tabs,
    Tab,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Typography,
    Switch,
    FormControlLabel
} from '@mui/material';
import { ChromePicker } from 'react-color';

interface TemplateStyle {
    headerColor: string;
    fontFamily: string;
    fontSize: number;
    boldHeaders: boolean;
    alternateRows: boolean;
}

interface ExportTemplate {
    id: number;
    name: string;
    description: string;
    format: string;
    columns: string[];
    styling: TemplateStyle;
}

interface TemplateCustomizationDialogProps {
    open: boolean;
    template: ExportTemplate | null;
    onClose: () => void;
    onSave: (template: ExportTemplate) => void;
}

export const TemplateCustomizationDialog: React.FC<TemplateCustomizationDialogProps> = ({
    open,
    template,
    onClose,
    onSave
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<ExportTemplate | null>(template);

    const handleStyleChange = (property: keyof TemplateStyle, value: any) => {
        if (!currentTemplate) return;

        setCurrentTemplate({
            ...currentTemplate,
            styling: {
                ...currentTemplate.styling,
                [property]: value
            }
        });
    };

    const handleSave = () => {
        if (currentTemplate) {
            onSave(currentTemplate);
        }
        onClose();
    };

    if (!currentTemplate) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Customize Template: {currentTemplate.name}
            </DialogTitle>
            <DialogContent>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    sx={{ mb: 2 }}
                >
                    <Tab label="Style" />
                    <Tab label="Columns" />
                    <Tab label="Preview" />
                </Tabs>

                {activeTab === 0 && (
                    <Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Header Color
                                    </Typography>
                                    <Button
                                        onClick={() => setShowColorPicker(!showColorPicker)}
                                        style={{
                                            backgroundColor: currentTemplate.styling.headerColor,
                                            width: 100,
                                            height: 40
                                        }}
                                    />
                                    {showColorPicker && (
                                        <Box position="absolute" zIndex={1}>
                                            <ChromePicker
                                                color={currentTemplate.styling.headerColor}
                                                onChange={(color) => handleStyleChange('headerColor', color.hex)}
                                            />
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Font Family</InputLabel>
                                    <Select
                                        value={currentTemplate.styling.fontFamily}
                                        onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                                    >
                                        <MenuItem value="Arial">Arial</MenuItem>
                                        <MenuItem value="Helvetica">Helvetica</MenuItem>
                                        <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Font Size</InputLabel>
                                    <Select
                                        value={currentTemplate.styling.fontSize}
                                        onChange={(e) => handleStyleChange('fontSize', e.target.value as number)}
                                    >
                                        {[10, 11, 12, 13, 14, 16].map(size => (
                                            <MenuItem key={size} value={size}>{size}px</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={currentTemplate.styling.boldHeaders}
                                            onChange={(e) => handleStyleChange('boldHeaders', e.target.checked)}
                                        />
                                    }
                                    label="Bold Headers"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={currentTemplate.styling.alternateRows}
                                            onChange={(e) => handleStyleChange('alternateRows', e.target.checked)}
                                        />
                                    }
                                    label="Alternate Row Colors"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box>
                        <ColumnManager
                            availableColumns={[
                                { id: 'date', name: 'Date', visible: true },
                                { id: 'mentor_name', name: 'Mentor Name', visible: true },
                                { id: 'mentee_name', name: 'Mentee Name', visible: true },
                                { id: 'match_score', name: 'Match Score', visible: true },
                                { id: 'session_duration', name: 'Session Duration', visible: true },
                                { id: 'status', name: 'Status', visible: true },
                                { id: 'industry', name: 'Industry', visible: true },
                                { id: 'skills', name: 'Skills', visible: true },
                                { id: 'goals', name: 'Goals', visible: true },
                                { id: 'progress', name: 'Progress', visible: true },
                                { id: 'next_session', name: 'Next Session', visible: true },
                                { id: 'feedback', name: 'Feedback', visible: true }
                            ]}
                            selectedColumns={currentTemplate.columns.map(col => ({
                                id: col,
                                name: col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' '),
                                visible: true
                            }))}
                            onColumnsChange={(columns) => {
                                setCurrentTemplate({
                                    ...currentTemplate,
                                    columns: columns.map(col => col.id)
                                });
                            }}
                        />
                    </Box>
                )}

                {activeTab === 2 && (
                    <Box>
                        {/* Preview UI will go here */}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};
