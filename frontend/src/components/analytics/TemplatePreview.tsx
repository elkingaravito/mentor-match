import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
    Paper,
    Tab,
    Tabs
} from '@mui/material';
import { Document, Page } from 'react-pdf';
import { api } from '../../services/api';

interface TemplatePreviewProps {
    open: boolean;
    onClose: () => void;
    template: any;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
    open,
    onClose,
    template
}) => {
    const [preview, setPreview] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (open && template) {
            generatePreview();
        }
    }, [open, template]);

    const generatePreview = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/templates/preview', template);
            setPreview(response.data);
        } catch (err) {
            setError('Failed to generate preview');
            console.error('Preview generation error:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderPreview = () => {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                </Box>
            );
        }

        if (error) {
            return (
                <Box p={3}>
                    <Typography color="error">{error}</Typography>
                </Box>
            );
        }

        if (!preview) {
            return null;
        }

        switch (preview.type) {
            case 'text':
                return (
                    <Paper sx={{ p: 2, fontFamily: 'monospace', whiteSpace: 'pre' }}>
                        {preview.content}
                    </Paper>
                );

            case 'excel':
                return (
                    <Box>
                        <img
                            src={`data:image/png;base64,${preview.content}`}
                            alt="Excel Preview"
                            style={{ maxWidth: '100%' }}
                        />
                    </Box>
                );

            case 'pdf':
                return (
                    <Box>
                        <Document file={`data:application/pdf;base64,${preview.content}`}>
                            <Page pageNumber={1} />
                        </Document>
                    </Box>
                );

            default:
                return (
                    <Typography>Preview not available for this format</Typography>
                );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>Template Preview</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TemplateCustomizer
                            template={template}
                            onTemplateChange={(newTemplate) => {
                                setTemplate(newTemplate);
                            }}
                            availableColumns={[
                                'Date',
                                'Mentor Name',
                                'Mentee Name',
                                'Match Score',
                                'Session Duration',
                                'Status',
                                'Industry',
                                'Skills',
                                'Goals',
                                'Progress'
                            ]}
                            onPreviewRefresh={generatePreview}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, minHeight: 500 }}>
                            {renderPreview()}
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                    >
                        <Tab label="Preview" />
                        <Tab label="Template Details" />
                    </Tabs>
                </Box>

                {activeTab === 0 ? (
                    <Box sx={{ minHeight: 400 }}>
                        {renderPreview()}
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="h6">Template Configuration</Typography>
                        <pre>
                            {JSON.stringify(template, null, 2)}
                        </pre>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button
                    variant="contained"
                    onClick={generatePreview}
                    disabled={loading}
                >
                    Refresh Preview
                </Button>
            </DialogActions>
        </Dialog>
    );
};
