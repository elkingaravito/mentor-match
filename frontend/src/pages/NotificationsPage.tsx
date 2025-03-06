import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useGetUserNotificationsQuery } from '../services/api';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useGetUserNotificationsQuery(user?.id || 0, {
    skip: !user,
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Notificaciones
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : notifications && notifications.length > 0 ? (
        <List>
          {notifications.map((notification) => (
            <ListItem key={notification.id}>
              <ListItemAvatar>
                <Avatar>{notification.type.charAt(0)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.type}
                secondary={notification.message}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No hay notificaciones nuevas.</Typography>
      )}
    </Box>
  );
};

export default NotificationsPage;