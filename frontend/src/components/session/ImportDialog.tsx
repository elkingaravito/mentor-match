import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    RadioGroup,
    Radio,
    FormControlLabel,
    FormControl,
    FormLabel,
    LinearProgress,
    Alert,
    IconButton,
    useTheme,
    Chip
} from '@mui/material';
import {
    Upload as UploadIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { ImportFormat, ImportResult } from '../../services/importService';

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onImport: (file: File, format: ImportFormat) => Promise<ImportResult>;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
    open,
    onClose,
    onImport
}) => {
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [format, setFormat] = useState<ImportFormat['type']>('json');
    const [mergeStrategy, setMergeStrategy] = useState<ImportFormat['mergeStrategy']>('append');
    const [validateData, setValidateData] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) return;

        setIsImporting(true);
        setError(null);
        try {
            const importResult = await onImport(selectedFile, {
                type: format,
                validateData,
                mergeStrategy
            });
            setResult(importResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Import failed');
        } finally {
            setIsImporting(false);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setResult(null);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Import Session Data</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box
                        sx={{
                            border: `2px dashed ${theme.palette.divider}`,
                            borderRadius: 1,
                            p: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: theme.palette.primary.main
                            }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            accept=".json,.csv,.md"
                        />
                        <UploadIcon sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
                        <Typography variant="body1">
                            Drag and drop a file here, or click to select
                        </Typography>
                        {selectedFile && (
                            <Chip
                                label={selectedFile.name}
                                onDelete={() => setSelectedFile(null)}
                                sx={{ mt: 1 }}
                            />
                        )}
                    </Box>

                    <FormControl component="fieldset">
                        <FormLabel component="legend">Import Format</FormLabel>
                        <RadioGroup
                            value={format}
                            onChange={(e) => setFormat(e.target.value as ImportFormat['type'])}
                        >
                            <FormControlLabel
                                value="json"
                                control={<Radio />}
                                label="JSON"
                            />
                            <FormControlLabel
                                value="csv"
                                control={<Radio />}
                                label="CSV"
                            />
                            <FormControlLabel
                                value="markdown"
                                control={<Radio />}
                                label="Markdown"
                            />
                        </RadioGroup>
                    </FormControl>

                    <FormControl component="fieldset">
                        <FormLabel component="legend">Import Options</FormLabel>
                        <RadioGroup
                            value={mergeStrategy}
                            onChange={(e) => setMergeStrategy(e.target.value as ImportFormat['mergeStrategy'])}
                        >
                            <FormControlLabel
                                value="append"
                                control={<Radio />}
                                label="Append to existing activities"
                            />
                            <FormControlLabel
                                value="replace"
                                control={<Radio />}
                                label="Replace existing activities"
                            />
                            <FormControlLabel
                                value="merge"
                                control={<Radio />}
                                label="Merge with existing activities"
                            />
                        </RadioGroup>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Radio
                                checked={validateData}
                                onChange={(e) => setValidateData(e.target.checked)}
                            />
                        }
                        label="Validate data before import"
                    />

                    {isImporting && (
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />
                        </Box>
                    )}

                    {error && (
                        <Alert
                            severity="error"
                            action={
                                <IconButton
                                    color="inherit"
                                    size="small"
                                    onClick={() => setError(null)}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            }
                        >
                            {error}
                        </Alert>
                    )}

                    {result && (
                        <Alert
                            severity="success"
                            icon={<CheckCircleIcon />}
                        >
                            Successfully imported {result.stats.imported} activities
                            {result.stats.skipped > 0 && ` (${result.stats.skipped} skipped)`}
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleImport}
                    variant="contained"
                    disabled={!selectedFile || isImporting}
                    startIcon={isImporting ? <LinearProgress size={20} /> : null}
                >
                    {isImporting ? 'Importing...' : 'Import'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};