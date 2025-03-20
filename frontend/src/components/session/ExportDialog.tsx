import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    FormControlLabel,
    Checkbox,
    RadioGroup,
    Radio,
    Typography,
    Box,
    CircularProgress,
    Alert,
    useTheme
} from '@mui/material';
import { ExportFormat } from '../../services/exportService';

interface ExportDialogProps {
    open: boolean;
    onClose: () => void;
    onExport: (format: ExportFormat) => Promise<void>;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
    open,
    onClose,
    onExport
}) => {
    const theme = useTheme();
    const [format, setFormat] = useState<ExportFormat['type']>('json');
    const [includeMetrics, setIncludeMetrics] = useState(true);
    const [includeTrends, setIncludeTrends] = useState(true);
    const [includeActivities, setIncludeActivities] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExport = async () => {
        setIsExporting(true);
        setError(null);
        try {
            await onExport({
                type: format,
                includeMetrics,
                includeTrends,
                includeActivities
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Export Session Data</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControl component="fieldset">
                        <Typography variant="subtitle2" gutterBottom>
                            Export Format
                        </Typography>
                        <RadioGroup
                            value={format}
                            onChange={(e) => setFormat(e.target.value as ExportFormat['type'])}
                        >
                            <FormControlLabel
                                value="json"
                                control={<Radio />}
                                label="JSON (Complete data export)"
                            />
                            <FormControlLabel
                                value="csv"
                                control={<Radio />}
                                label="CSV (Spreadsheet compatible)"
                            />
                            <FormControlLabel
                                value="markdown"
                                control={<Radio />}
                                label="Markdown (Documentation friendly)"
                            />
                            <FormControlLabel
                                value="pdf"
                                control={<Radio />}
                                label="PDF (Print ready)"
                            />
                        </RadioGroup>
                    </FormControl>

                    <FormControl component="fieldset">
                        <Typography variant="subtitle2" gutterBottom>
                            Include Data
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={includeActivities}
                                    onChange={(e) => setIncludeActivities(e.target.checked)}
                                />
                            }
                            label="Activities"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={includeMetrics}
                                    onChange={(e) => setIncludeMetrics(e.target.checked)}
                                />
                            }
                            label="Metrics"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={includeTrends}
                                    onChange={(e) => setIncludeTrends(e.target.checked)}
                                />
                            }
                            label="Trends"
                        />
                    </FormControl>

                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleExport}
                    variant="contained"
                    disabled={isExporting || (!includeActivities && !includeMetrics && !includeTrends)}
                    startIcon={isExporting ? <CircularProgress size={20} /> : null}
                >
                    {isExporting ? 'Exporting...' : 'Export'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};