import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  IconButton, 
  Box,
  CircularProgress 
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Inbox as InboxIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { variants, transitions, createStaggerVariants } from '../animations';
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useDeleteNotificationMutation } from '../../services/api';
import { useToast } from '../feedback/Toast';
import { useConfirmDialog } from '../feedback/ConfirmDialog';
import EmptyState from '../feedback/EmptyState';
import { useMemo } from 'react';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  data: Notification[];
  status: string;
}

const NotificationsList: React.FC = () => {
  const { data: notificationsData, isLoading, error } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const { showToast } = useToast();
  const { confirm } = useConfirmDialog();

  const styles = {
    container: {
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const
    },
    listItem: {
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
      },
      borderRadius: 1,
      mb: 1,
      position: 'relative' as const
    },
    actionButtons: {
      display: 'flex',
      gap: 1
    }
  };

  const notifications = useMemo(() => {
    return (notificationsData as NotificationsResponse)?.data || [];
  }, [notificationsData]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id).unwrap();
      showToast('Notification marked as read', 'success');
    } catch (error) {
      showToast('Failed to mark notification as read', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      confirmLabel: 'Delete',
      severity: 'warning',
    });

    if (confirmed) {
      try {
        await deleteNotification(id).unwrap();
        showToast('Notification deleted', 'success');
      } catch (error) {
        showToast('Failed to delete notification', 'error');
      }
    }
  };

  if (isLoading || error) {
    return (
      <EmptyState
        icon={NotificationsIcon}
        title={isLoading ? "Loading Notifications" : "Error Loading Notifications"}
        description={
          isLoading 
            ? "Please wait while we fetch your notifications..." 
            : "There was a problem loading your notifications. Please try again later."
        }
        loading={isLoading}
        error={!!error}
        retry={() => window.location.reload()}
      />
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={InboxIcon}
        title="No Notifications"
        description="You're all caught up! Check back later for new notifications."
      />
    );
  }

  const containerVariants = createStaggerVariants(0.05, 0.1);
  const notificationVariants = {
    ...variants.listItem,
    hover: {
      ...variants.listItem.hover,
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  };

  return (
    <Paper 
      component={motion.div}
      variants={variants.fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transitions.spring.default}
      sx={styles.container}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Recent Notifications
      </Typography>
      <List 
        component={motion.ul}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        sx={{ p: 0 }}
      >
        <AnimatePresence mode="popLayout">
          {notifications.slice(0, 5).map((notification) => (
          <motion.div
            key={notification.id}
            variants={notificationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover="hover"
            whileTap="tap"
            layout
          >
            <ListItem
              sx={styles.listItem}
              secondaryAction={
                <Box sx={styles.actionButtons}>
                  {!notification.read && (
                    <motion.div
                      variants={variants.scaleIn}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ display: 'inline-block' }}
                    >
                      <IconButton
                        edge="end"
                        aria-label="mark as read"
                        onClick={() => handleMarkAsRead(notification.id)}
                        size="small"
                      >
                        <CheckIcon />
                      </IconButton>
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ display: 'inline-block' }}
                  >
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(notification.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </motion.div>
                </Box>
              }
            >
              <ListItemIcon>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={notification.read ? { rotate: 0 } : {
                    rotate: [0, -15, 15, -10, 10, -5, 5, 0]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: notification.read ? 0 : Infinity,
                    repeatDelay: 5
                  }}
                >
                  <NotificationsIcon
                    color={notification.read ? 'disabled' : 'primary'}
                  />
                </motion.div>
              </ListItemIcon>
              <ListItemText
                primary={notification.message}
                secondary={new Date(notification.createdAt).toLocaleDateString()}
                primaryTypographyProps={{
                  style: {
                    fontWeight: notification.read ? 'normal' : 'bold'
                  }
                }}
              />
            </ListItem>
          </motion.div>
          ))}
        </AnimatePresence>
      </List>
    </Paper>
  );
};

export default NotificationsList;
