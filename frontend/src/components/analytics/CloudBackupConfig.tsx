import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondary,
    Switch,
    TextField,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    Stack
} from '@mui/material';
import {
    Cloud as CloudIcon,
    CloudDone as CloudDoneIcon,
    CloudOff as CloudOffIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { CloudBackupService } from '../../services/CloudBackupService';

interface CloudBackupConfigProps {
    open: boolean;
    onClose: () => void;
}

export const CloudBackupConfig: React.FC<CloudBackupConfigProps> = ({
    open,
    onClose
}) => {
    const [providers, setProviders] = useState(CloudBackupService.getAvailableProviders());
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [configuring, setConfiguring] = useState(false);
    const [syncEnabled, setSyncEnabled] = useState<Record<string, boolean>>({});
    const [syncFrequency, setSyncFrequency] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfigureProvider = async (providerId: string) => {
        setConfiguring(true);
        setError(null);

        try {
            // Start provider-specific OAuth flow or configuration
            const success = await CloudBackupService.configureProvider(providerId, {
                // Provider-specific configuration
            });

            if (success) {
                const updatedProviders = CloudBackupService.getAvailableProviders();
                setProviders(updatedProviders);
                setSelectedProvider(null);
            }
        } catch (error) {
            setError('Failed to configure provider');
            console.error('Provider configuration error:', error);
        } finally {
            setConfiguring(false);
        }
    };

    const handleToggleSync = async (providerId: string, enabled: boolean) => {
        setLoading(true);
        setError(null);

        try {
            if (enabled) {
                await CloudBackupService.enableAutoSync(
                    providerId,
                    syncFrequency[providerId] || 3600000 // Default to 1 hour
                );
            }

            setSyncEnabled(prev => ({
                ...prev,
                [providerId]: enabled
            }));
        } catch (error) {
            setError('Failed to configure auto-sync');
            console.error('Sync configuration error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSyncFrequency = async (providerId: string, frequency: number) => {
        if (syncEnabled[providerId]) {
            try {
                await CloudBackupService.enableAutoSync(providerId, frequency);
                setSyncFrequency(prev => ({
                    ...prev,
                    [providerId]: frequency
                }));
            } catch (error) {
                console.error('Failed to update sync frequency:', error);
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Cloud Backup Configuration</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <List>
                    {providers.map(provider => (
                        <React.Fragment key={provider.id}>
                            <ListItem>
                                <ListItemIcon>
                                    {provider.isConfigured ? (
                                        <CloudDoneIcon color="success" />
                                    ) : (
                                        <CloudOffIcon color="disabled" />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={provider.name}
                                    secondary={
                                        provider.isConfigured
                                            ? 'Connected'
                                            : 'Not configured'
                                    }
                                />
                                <Stack direction="row" spacing={2} alignItems="center">
                                    {provider.isConfigured && (
                                        <>
                                            <TextField
                                                select
                                                size="small"
                                                label="Sync Frequency"
                                                value={syncFrequency[provider.id] || 3600000}
                                                onChange={(e) => handleUpdateSyncFrequency(
                                                    provider.id,
                                                    Number(e.target.value)
                                                )}
                                                disabled={!syncEnabled[provider.id]}
                                            >
                                                <MenuItem value={900000}>15 minutes</MenuItem>
                                                <MenuItem value={3600000}>1 hour</MenuItem>
                                                <MenuItem value={86400000}>1 day</MenuItem>
                                            </TextField>
                                            <Switch
                                                checked={syncEnabled[provider.id] || false}
                                                onChange={(e) => handleToggleSync(
                                                    provider.id,
                                                    e.target.checked
                                                )}
                                            />
                                        </>
                                    )}
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleConfigureProvider(provider.id)}
                                        disabled={configuring}
                                    >
                                        {provider.isConfigured ? 'Reconfigure' : 'Configure'}
                                    </Button>
                                </Stack>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>

                {loading && (
                    <Box display="flex" justifyContent="center" my={2}>
                        <CircularProgress />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};