import { AppBar, Toolbar, Typography, IconButton, Box, Badge, Avatar } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useGetNotificationsQuery } from '../services/api';
import { WebSocketStatus } from './WebSocketStatus';

const Header = () => {
  const { user } = useAuth();
  const { data: notificationsData } = useGetNotificationsQuery();
  const unreadCount = notificationsData?.data?.filter(n => !n.read).length || 0;

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
      </Toolbar>
    </AppBar>
  );
};

export default Header;