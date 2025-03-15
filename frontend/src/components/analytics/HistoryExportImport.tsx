import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Alert,
    TextField,
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    FileDownload as ExportIcon,
    FileUpload as ImportIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import { ResolutionHistoryService } from '../../services/ResolutionHistoryService';

interface HistoryExportImportProps {
    onHistoryChange?: () => void;
}

export const HistoryExportImport: React.FC<HistoryExportImportProps> = ({
    onHistoryChange
}) => {
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importData, setImportData] = useState('');
    const [importError, setImportError] = useState<string | null>(null);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportData, setExportData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'compressed' | 'encrypted'>('json');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [compressionStatus, setCompressionStatus] = useState<{
        original: number;
        compressed: number;
    } | null>(null);
    const [keyManagementOpen, setKeyManagementOpen] = useState(false);
    const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);

    const handleExport = async () => {
        setLoading(true);
        try {
            let { data, mimeType } = await ResolutionHistoryService.exportHistory(
                exportFormat === 'encrypted' ? 'json' : exportFormat
            );

            if (exportFormat === 'encrypted') {
                // Validate password
                const validation = EncryptionService.validatePassword(password);
                if (!validation.isValid) {
                    setPasswordError(validation.message);
                    return;
                }

                // Encrypt the data
                data = await EncryptionService.encryptData(data, password);
                mimeType = 'application/encrypted';
            }

            setExportData(data);
            
            if (exportFormat === 'compressed' || exportFormat === 'encrypted') {
                setCompressionStatus({
                    original: JSON.stringify(ResolutionHistoryService.getSessionHistory()).length,
                    compressed: data.length
                });
            } else {
                setCompressionStatus(null);
            }
            
            setExportDialogOpen(true);
        } catch (error) {
            console.error('Export error:', error);
            setPasswordError('Encryption failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePassword = () => {
        const newPassword = EncryptionService.generateRandomPassword();
        setPassword(newPassword);
        setConfirmPassword(newPassword);
        setShowPassword(true);
    };

    const getExportMimeType = () => {
        switch (exportFormat) {
            case 'csv':
                return 'text/csv';
            case 'compressed':
                return 'application/x-compressed';
            default:
                return 'application/json';
        }
    };

    const getExportExtension = () => {
        switch (exportFormat) {
            case 'csv':
                return 'csv';
            case 'compressed':
                return 'gz';
            default:
                return 'json';
        }
    };

    const handleImport = () => {
        setLoading(true);
        try {
            const success = ResolutionHistoryService.importHistory(importData);
            if (success) {
                setImportDialogOpen(false);
                setImportData('');
                setImportError(null);
                onHistoryChange?.();
            } else {
                setImportError('Failed to import history data');
            }
        } catch (error) {
            setImportError('Invalid history data format');
            console.error('Import error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToClipboard = async () => {
        if (exportData) {
            try {
                await navigator.clipboard.writeText(exportData);
            } catch (error) {
                console.error('Copy to clipboard failed:', error);
            }
        }
    };

    const handleDownload = () => {
        if (exportData) {
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resolution-history-${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <>
            <Box display="flex" gap={1}>
                <Tooltip title="Export History">
                    <IconButton onClick={handleExport} disabled={loading}>
                        <ExportIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Import History">
                    <IconButton onClick={() => setImportDialogOpen(true)} disabled={loading}>
                        <ImportIcon />
                    </IconButton>
                </Tooltip>
                {loading && <CircularProgress size={24} />}
            </Box>

            {/* Export Dialog */}
            <Dialog
                open={exportDialogOpen}
                onClose={() => setExportDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Export Resolution History</DialogTitle>
                <DialogContent>
                    <Box mb={2}>
                        <FormControl fullWidth>
                            <InputLabel>Export Format</InputLabel>
                            <Select
                                value={exportFormat}
                                onChange={(e) => {
                                    setExportFormat(e.target.value as any);
                                    setPassword('');
                                    setConfirmPassword('');
                                    setPasswordError(null);
                                }}
                                label="Export Format"
                            >
                                <MenuItem value="json">JSON (Readable)</MenuItem>
                                <MenuItem value="csv">CSV (Spreadsheet)</MenuItem>
                                <MenuItem value="compressed">Compressed</MenuItem>
                                <MenuItem value="encrypted">Encrypted</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {exportFormat === 'encrypted' && (
                        <Box mb={2}>
                            <Typography variant="subtitle2" gutterBottom>
                                Encryption Password
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type={showPassword ? 'text' : 'password'}
                                        label="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        error={!!passwordError}
                                        helperText={passwordError}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type={showPassword ? 'text' : 'password'}
                                        label="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        error={password !== confirmPassword}
                                        helperText={
                                            password !== confirmPassword
                                                ? 'Passwords do not match'
                                                : ''
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setKeyManagementOpen(true)}
                                            startIcon={<KeyIcon />}
                                        >
                                            Select Encryption Key
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={handleGeneratePassword}
                                            startIcon={<LockIcon />}
                                        >
                                            Generate New Key
                                        </Button>
                                    </Stack>
                                </Grid>

                                {selectedKeyId && (
                                    <Grid item xs={12}>
                                        <Alert severity="success">
                                            Using saved encryption key
                                        </Alert>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}

                    <KeyManagementDialog
                        open={keyManagementOpen}
                        onClose={() => setKeyManagementOpen(false)}
                        onKeySelect={async (keyId) => {
                            const key = await KeyManagementService.getKey(keyId);
                            if (key) {
                                setSelectedKeyId(keyId);
                                setPassword(key);
                                setConfirmPassword(key);
                            }
                            setKeyManagementOpen(false);
                        }}
                    />

                    {compressionStatus && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                Original size: {(compressionStatus.original / 1024).toFixed(2)} KB
                            </Typography>
                            <Typography variant="body2">
                                Compressed size: {(compressionStatus.compressed / 1024).toFixed(2)} KB
                            </Typography>
                            <Typography variant="body2">
                                Compression ratio: {((1 - compressionStatus.compressed / compressionStatus.original) * 100).toFixed(1)}%
                            </Typography>
                        </Alert>
                    )}
                    <Box mb={2}>
                        <Typography variant="body2" gutterBottom>
                            Copy the data below or download it as a file:
                        </Typography>
                        <TextField
                            multiline
                            rows={10}
                            value={exportData || ''}
                            fullWidth
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                        />
                    </Box>
                    <Box display="flex" gap={1}>
                        <Button
                            startIcon={<CopyIcon />}
                            onClick={handleCopyToClipboard}
                        >
                            Copy to Clipboard
                        </Button>
                        <Button
                            startIcon={<ExportIcon />}
                            onClick={handleDownload}
                        >
                            Download File
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExportDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Import Dialog */}
            <Dialog
                open={importDialogOpen}
                onClose={() => setImportDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Import Resolution History</DialogTitle>
                <DialogContent>
                    <Box mb={2}>
                        <Typography variant="body2" gutterBottom>
                            Paste the exported history data below:
                        </Typography>
                        <TextField
                            multiline
                            rows={10}
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            fullWidth
                            variant="outlined"
                            error={!!importError}
                            helperText={importError}
                        />
                    </Box>
                    {importError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {importError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleImport}
                        variant="contained"
                        disabled={!importData || loading}
                    >
                        Import
                    </Button>
                </DialogActions>
            </Dialog>

            <KeyManagementDialog
                open={keyManagementOpen}
                onClose={() => setKeyManagementOpen(false)}
                onKeySelect={async (keyId) => {
                    const key = await KeyManagementService.getKey(keyId);
                    if (key) {
                        setSelectedKeyId(keyId);
                        setPassword(key);
                        setConfirmPassword(key);
                    }
                    setKeyManagementOpen(false);
                }}
            />
        </>
    );
};
