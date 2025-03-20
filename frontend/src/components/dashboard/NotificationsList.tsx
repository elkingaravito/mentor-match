import { Paper, Typography, List, ListItem, ListItemText, ListItemIcon, IconButton, Box } from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useDeleteNotificationMutation } from '../../services/api';

const NotificationsList = () => {
  const { data: notificationsData, isLoading } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  if (isLoading) {
    return <Typography>Loading notifications...</Typography>;
  }

  const notifications = notificationsData?.data || [];

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Recent Notifications
      </Typography>
      {notifications.length === 0 ? (
        <Typography color="text.secondary">No notifications</Typography>
      ) : (
        <List>
          {notifications.slice(0, 5).map((notification) => (
            <ListItem
              key={notification.id}
              secondaryAction={
                <Box>
                  {!notification.read && (
                    <IconButton 
                      edge="end" 
                      aria-label="mark as read"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckIcon />
                    </IconButton>
                  )}
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemIcon>
                <NotificationsIcon color={notification.read ? 'disabled' : 'primary'} />
              </ListItemIcon>
              <ListItemText
                primary={notification.message}
                secondary={new Date(notification.createdAt).toLocaleDateString()}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default NotificationsList;