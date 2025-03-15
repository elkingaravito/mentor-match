import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    InputAdornment
} from '@mui/material';
import {
    Backup as BackupIcon,
    Restore as RestoreIcon,
    Visibility,
    VisibilityOff,
    ContentCopy as CopyIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { KeyManagementService } from '../../services/KeyManagementService';

interface KeyBackupDialogProps {
    open: boolean;
    onClose: () => void;
    onComplete: () => void;
    mode: 'backup' | 'restore';
}

export const KeyBackupDialog: React.FC<KeyBackupDialogProps> = ({
    open,
    onClose,
    onComplete,
    mode
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [backupData, setBackupData] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [cloudBackupOpen, setCloudBackupOpen] = useState(false);
    const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);

    const handleBackup = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const backup = await KeyManagementService.createBackup(password);
            setBackupData(backup);
            setActiveStep(1);
        } catch (error) {
            setError('Failed to create backup');
            console.error('Backup error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!backupData) {
            setError('No backup data provided');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await KeyManagementService.restoreFromBackup(backupData, password);
            onComplete();
            onClose();
        } catch (error) {
            setError('Failed to restore backup: ' + (error as Error).message);
            console.error('Restore error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyBackup = async () => {
        if (backupData) {
            try {
                await navigator.clipboard.writeText(backupData);
            } catch (error) {
                console.error('Copy failed:', error);
            }
        }
    };

    const handleDownloadBackup = () => {
        if (backupData) {
            const blob = new Blob([backupData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `key-backup-${new Date().toISOString()}.bak`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const backupSteps = ['Create Backup', 'Save Backup'];
    const restoreSteps = ['Enter Backup Data', 'Verify and Restore'];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {mode === 'backup' ? 'Backup Encryption Keys' : 'Restore Encryption Keys'}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                    {(mode === 'backup' ? backupSteps : restoreSteps).map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {mode === 'backup' ? (
                    activeStep === 0 ? (
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Create a password to protect your backup:
                            </Typography>
                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                label="Backup Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 2 }}
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
                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                label="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Your backup is ready. Save it securely:
                            </Typography>
                            <Stack spacing={2}>
                                <Box display="flex" gap={2}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CopyIcon />}
                                        onClick={handleCopyBackup}
                                    >
                                        Copy to Clipboard
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<DownloadIcon />}
                                        onClick={handleDownloadBackup}
                                    >
                                        Download File
                                    </Button>
                                </Box>
                                
                                <Divider>
                                    <Chip label="OR" />
                                </Divider>

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<CloudIcon />}
                                        onClick={() => setCloudBackupOpen(true)}
                                    >
                                        Save to Cloud Storage
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<HistoryIcon />}
                                        onClick={() => setVersionHistoryOpen(true)}
                                    >
                                        Version History
                                    </Button>
                                </Stack>

                                <VersionHistory
                                    open={versionHistoryOpen}
                                    onClose={() => setVersionHistoryOpen(false)}
                                    onRestore={async (versionId) => {
                                        try {
                                            const restoredData = await VersionManagementService.getVersion(versionId);
                                            if (restoredData) {
                                                setBackupData(restoredData);
                                                setVersionHistoryOpen(false);
                                            }
                                        } catch (error) {
                                            console.error('Version restore failed:', error);
                                        }
                                    }}
                                />
                            </Stack>

                            <CloudBackupConfig
                                open={cloudBackupOpen}
                                onClose={() => setCloudBackupOpen(false)}
                            />
                        </Box>
                    )
                ) : (
                    activeStep === 0 ? (
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Paste your backup data or upload a backup file:
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={6}
                                value={backupData || ''}
                                onChange={(e) => setBackupData(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Button
                                variant="outlined"
                                component="label"
                            >
                                Upload Backup File
                                <input
                                    type="file"
                                    hidden
                                    accept=".bak"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (e) => {
                                                setBackupData(e.target?.result as string);
                                            };
                                            reader.readAsText(file);
                                        }
                                    }}
                                />
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Enter the backup password:
                            </Typography>
                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                label="Backup Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        </Box>
                    )
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                {loading ? (
                    <CircularProgress size={24} />
                ) : (
                    <Button
                        variant="contained"
                        onClick={mode === 'backup' ? handleBackup : handleRestore}
                        disabled={
                            (mode === 'backup' && activeStep === 0 && (!password || !confirmPassword)) ||
                            (mode === 'restore' && (!backupData || !password))
                        }
                    >
                        {mode === 'backup' ? (
                            activeStep === 0 ? 'Create Backup' : 'Finish'
                        ) : (
                            activeStep === 0 ? 'Next' : 'Restore'
                        )}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
