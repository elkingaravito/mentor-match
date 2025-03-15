import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Typography,
    SelectChangeEvent,
    Snackbar,
    Alert
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { api } from '../../services/api';

interface ExportControlsProps {
    filters: any;
    onExportStart?: () => void;
    onExportComplete?: () => void;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
    filters,
    onExportStart,
    onExportComplete
}) => {
    const [exportFormat, setExportFormat] = useState('csv');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFormatChange = (event: SelectChangeEvent<string>) => {
        setExportFormat(event.target.value);
    };

    const handleExport = async () => {
        try {
            setLoading(true);
            onExportStart?.();
            setError(null);

            // Build query parameters
            const params = new URLSearchParams({
                format: exportFormat,
                ...filters
            });

            // Make API request
            const response = await api.get(`/analytics/export?${params}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `mentor_match_analytics.${exportFormat}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            onExportComplete?.();
        } catch (err) {
            setError('Failed to export data. Please try again.');
            console.error('Export error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                            <ExportTemplateManager
                                onTemplateSelect={(template) => {
                                    setExportFormat(template.format);
                                    // Apply template settings
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6">
                                Export Analytics Data
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Download analytics data in your preferred format
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Export Format</InputLabel>
                                <Select
                                    value={exportFormat}
                                    onChange={handleFormatChange}
                                    label="Export Format"
                                >
                                    <MenuItem value="csv">CSV</MenuItem>
                                    <MenuItem value="excel">Excel</MenuItem>
                                    <MenuItem value="pdf">PDF Report</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleExport}
                                disabled={loading}
                                startIcon={<FileDownloadIcon />}
                            >
                                {loading ? 'Exporting...' : 'Export Data'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
};
