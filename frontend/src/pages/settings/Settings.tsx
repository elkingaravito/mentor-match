import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: 'Profile Settings',
      path: '/settings/profile',
      icon: PersonIcon,
      description: 'Update your personal information and preferences',
    },
    {
      title: 'Notification Settings',
      path: '/settings/notifications',
      icon: NotificationsIcon,
      description: 'Manage your notification preferences',
    },
    {
      title: 'Security Settings',
      path: '/settings/security',
      icon: SecurityIcon,
      description: 'Update your password and security preferences',
    },
    {
      title: 'Language & Region',
      path: '/settings/language',
      icon: LanguageIcon,
      description: 'Change your language and regional preferences',
    },
    {
      title: 'Appearance',
      path: '/settings/appearance',
      icon: PaletteIcon,
      description: 'Customize the app appearance',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <List>
          {settingsSections.map((section, index) => (
            <React.Fragment key={section.title}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate(section.path)}
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    <section.icon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={section.title}
                    secondary={section.description}
                    primaryTypographyProps={{
                      fontWeight: 'medium',
                    }}
                  />
                </ListItemButton>
              </ListItem>
              {index < settingsSections.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Settings;