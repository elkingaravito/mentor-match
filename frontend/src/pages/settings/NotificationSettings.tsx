import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Switch,
  Divider,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useGetNotificationSettingsQuery, useUpdateNotificationSettingsMutation } from '../../services/api';

interface NotificationSetting {
  id: string;
  type: string;
  description: string;
  enabled: boolean;
}

const NotificationSettings: React.FC = () => {
  const { data: settings, isLoading } = useGetNotificationSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateNotificationSettingsMutation();

  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSetting[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (settings?.data) {
      setNotificationSettings(settings.data);
    }
  }, [settings]);

  const handleToggle = (id: string) => {
    setNotificationSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSave = async () => {
    try {
      await updateSettings(notificationSettings).unwrap();
      setSuccess('Notification settings updated successfully');
      setError(null);
    } catch (err) {
      setError('Failed to update notification settings');
      setSuccess(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Notification Settings
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <List>
          {notificationSettings.map((setting, index) => (
            <React.Fragment key={setting.id}>
              <ListItem>
                <ListItemText
                  primary={setting.type}
                  secondary={setting.description}
                />
                <Switch
                  edge="end"
                  checked={setting.enabled}
                  onChange={() => handleToggle(setting.id)}
                />
              </ListItem>
              {index < notificationSettings.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {(error || success) && (
          <Box sx={{ p: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
          </Box>
        )}

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotificationSettings;