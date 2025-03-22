import React, { useEffect } from 'react';
import type { Notification } from '@/types/api';
import { AppBar, Toolbar, Typography, IconButton, Box, Badge, Avatar } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useGetNotificationsQuery } from '../services/notificationsSlice';
import { WebSocketStatus } from '@/components/WebSocketStatus';
import { useToast } from '@/components/feedback/Toast';

const Header = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();
  
  const { data: notifications = [], error: notificationsError, isFetching } = useGetNotificationsQuery(undefined, {
    skip: !isAuthenticated || isLoading,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (notificationsError) {
      showToast('Error loading notifications', 'error');
      console.error('Notifications error:', notificationsError);
    }
  }, [notificationsError, showToast]);

  // Add loading indicator to the badge
  const badgeContent = isFetching ? '...' : unreadCount;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Mentor Match
        </Typography>

        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WebSocketStatus />
            
            <IconButton color="inherit">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                {user?.name}
              </Typography>
              <Avatar 
                sx={{ width: 32, height: 32 }}
                alt={user?.name}
              >
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
