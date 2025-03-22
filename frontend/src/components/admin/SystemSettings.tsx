import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    Divider,
    TextField,
    Switch,
    Slider,
    Button,
    FormControl,
    FormControlLabel,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Grid,
    Chip,
} from '@mui/material';
import {
    Save as SaveIcon,
    Refresh as RefreshIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Schedule as ScheduleIcon,
    Group as GroupIcon,
} from '@mui/icons-material';
import { SystemSettings } from '../../types/settings';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { LoadingButton } from '../feedback/LoadingButton';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
        {value === index && children}
    </Box>
);

export const SystemSettingsPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const { 
        settings, 
        loading, 
        error, 
        updateSettings, 
        resetToDefaults 
    } = useSystemSettings();

    const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const handleChange = (section: keyof SystemSettings, subsection: string, value: any) => {
        setLocalSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subsection]: value,
            },
        }));
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            await updateSettings(localSettings);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            setSaveStatus('error');
        }
    };

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
            await resetToDefaults();
        }
    };

    if (loading) {
        return <Box sx={{ p: 3 }}><Typography>Loading settings...</Typography></Box>;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">System Settings</Typography>
                <Box>
                    <LoadingButton
                        variant="contained"
                        startIcon={<SaveIcon />}
                        loading={saveStatus === 'saving'}
                        onClick={handleSave}
                        sx={{ mr: 1 }}
                    >
                        Save Changes
                    </LoadingButton>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleReset}
                    >
                        Reset to Defaults
                    </Button>
                </Box>
            </Box>

            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab icon={<GroupIcon />} label="Matching" />
                <Tab icon={<ScheduleIcon />} label="Sessions" />
                <Tab icon={<SecurityIcon />} label="Security" />
                <Tab icon={<NotificationsIcon />} label="Notifications" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Matching Criteria</Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography gutterBottom>Minimum Compatibility Score</Typography>
                            <Slider
                                value={localSettings.matching.minCompatibilityScore}
                                onChange={(_, value) => 
                                    handleChange('matching', 'minCompatibilityScore', value)}
                                min={0}
                                max={100}
                                valueLabelDisplay="auto"
                            />
                        </Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={localSettings.matching.autoMatchEnabled}
                                    onChange={(e) => 
                                        handleChange('matching', 'autoMatchEnabled', e.target.checked)}
                                />
                            }
                            label="Enable Automatic Matching"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Matching Weights</Typography>
                        {Object.entries(localSettings.matching.matchingCriteria).map(([key, value]) => (
                            <Box key={key} sx={{ mb: 2 }}>
                                <Typography gutterBottom>
                                    {key.charAt(0).toUpperCase() + key.slice(1)} Weight
                                </Typography>
                                <Slider
                                    value={value}
                                    onChange={(_, newValue) => 
                                        handleChange('matching', `matchingCriteria.${key}`, newValue)}
                                    min={0}
                                    max={100}
                                    valueLabelDisplay="auto"
                                />
                            </Box>
                        ))}
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Session Settings</Typography>
                        <TextField
                            fullWidth
                            label="Minimum Duration (minutes)"
                            type="number"
                            value={localSettings.sessions.minDuration}
                            onChange={(e) => 
                                handleChange('sessions', 'minDuration', parseInt(e.target.value))}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Maximum Duration (minutes)"
                            type="number"
                            value={localSettings.sessions.maxDuration}
                            onChange={(e) => 
                                handleChange('sessions', 'maxDuration', parseInt(e.target.value))}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Cancellation Policy</Typography>
                        <TextField
                            fullWidth
                            label="Cancellation Deadline (hours)"
                            type="number"
                            value={localSettings.sessions.cancelationPolicy.deadline}
                            onChange={(e) => 
                                handleChange('sessions', 'cancelationPolicy.deadline', parseInt(e.target.value))}
                            sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={localSettings.sessions.cancelationPolicy.penaltyEnabled}
                                    onChange={(e) => 
                                        handleChange('sessions', 'cancelationPolicy.penaltyEnabled', e.target.checked)}
                                />
                            }
                            label="Enable Cancellation Penalty"
                        />
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Password Policy</Typography>
                        <TextField
                            fullWidth
                            label="Minimum Length"
                            type="number"
                            value={localSettings.security.passwordPolicy.minLength}
                            onChange={(e) => 
                                handleChange('security', 'passwordPolicy.minLength', parseInt(e.target.value))}
                            sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={localSettings.security.passwordPolicy.requireNumbers}
                                    onChange={(e) => 
                                        handleChange('security', 'passwordPolicy.requireNumbers', e.target.checked)}
                                />
                            }
                            label="Require Numbers"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Security Settings</Typography>
                        <TextField
                            fullWidth
                            label="Session Timeout (minutes)"
                            type="number"
                            value={localSettings.security.sessionTimeout}
                            onChange={(e) => 
                                handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                            sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={localSettings.security.twoFactorRequired}
                                    onChange={(e) => 
                                        handleChange('security', 'twoFactorRequired', e.target.checked)}
                                />
                            }
                            label="Require Two-Factor Authentication"
                        />
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Notification Channels</Typography>
                        {['email', 'push', 'inApp'].map((channel) => (
                            <FormControlLabel
                                key={channel}
                                control={
                                    <Switch
                                        checked={localSettings.notifications.defaultChannels.includes(channel as any)}
                                        onChange={(e) => {
                                            const channels = e.target.checked
                                                ? [...localSettings.notifications.defaultChannels, channel]
                                                : localSettings.notifications.defaultChannels
                                                    .filter(c => c !== channel);
                                            handleChange('notifications', 'defaultChannels', channels);
                                        }}
                                    />
                                }
                                label={channel.charAt(0).toUpperCase() + channel.slice(1)}
                            />
                        ))}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Quiet Hours</Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={localSettings.notifications.quietHours.enabled}
                                    onChange={(e) => 
                                        handleChange('notifications', 'quietHours.enabled', e.target.checked)}
                                />
                            }
                            label="Enable Quiet Hours"
                        />
                        <TextField
                            fullWidth
                            label="Start Time"
                            type="time"
                            value={localSettings.notifications.quietHours.start}
                            onChange={(e) => 
                                handleChange('notifications', 'quietHours.start', e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="End Time"
                            type="time"
                            value={localSettings.notifications.quietHours.end}
                            onChange={(e) => 
                                handleChange('notifications', 'quietHours.end', e.target.value)}
                        />
                    </Grid>
                </Grid>
            </TabPanel>

            {saveStatus === 'success' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Settings saved successfully
                </Alert>
            )}
            {saveStatus === 'error' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Failed to save settings
                </Alert>
            )}
        </Paper>
    );
};