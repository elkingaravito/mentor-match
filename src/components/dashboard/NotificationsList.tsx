import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
}

interface NotificationsListProps {
  notifications: Notification[] | undefined;
  isLoading: boolean;
}

export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  isLoading
}) => {
  const navigate = useNavigate();

  const unreadNotifications = notifications?.filter(n => !n.read).slice(0, 3);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notificaciones Recientes
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : unreadNotifications && unreadNotifications.length > 0 ? (
          <List>
            {unreadNotifications.map((notification) => (
              <ListItem key={notification.id}>
                <ListItemText
                  primary={notification.type}
                  secondary={notification.message}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No hay notificaciones nuevas</Typography>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => navigate('/notifications')}>
          Ver todas las notificaciones
        </Button>
      </CardActions>
    </Card>
  );
};