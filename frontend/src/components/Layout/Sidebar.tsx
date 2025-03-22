import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  Divider,
  useTheme,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Search as SearchIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 280;

interface MenuItem {
  title: string;
  path?: string;
  icon: React.ElementType;
  children?: MenuItem[];
}

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: DashboardIcon,
    },
    {
      title: 'Mentors',
      icon: GroupIcon,
      children: [
        {
          title: 'Find Mentors',
          path: '/mentors/search',
          icon: SearchIcon,
        },
        {
          title: 'My Mentors',
          path: '/mentors',
          icon: PeopleIcon,
        },
      ],
    },
    {
      title: 'Sessions',
      icon: CalendarIcon,
      children: [
        {
          title: 'Schedule Session',
          path: '/sessions/schedule',
          icon: CalendarIcon,
        },
        {
          title: 'My Sessions',
          path: '/sessions',
          icon: AssessmentIcon,
        },
      ],
    },
    {
      title: 'Messages',
      path: '/messages',
      icon: MessageIcon,
    },
    {
      title: 'Notifications',
      path: '/notifications',
      icon: NotificationsIcon,
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: PersonIcon,
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: SettingsIcon,
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      setOpenMenus(prev => ({
        ...prev,
        [item.title]: !prev[item.title]
      }));
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isSelected = item.path === location.pathname;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.title];

    return (
      <React.Fragment key={item.title}>
        <ListItem 
          disablePadding
          sx={{ 
            pl: depth * 2,
          }}
        >
          <ListItemButton
            selected={isSelected}
            onClick={() => handleMenuClick(item)}
            sx={{
              borderRadius: 1,
              m: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <item.icon />
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: isSelected ? 'bold' : 'normal',
              }}
            />
            {hasChildren && (
              isOpen ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="h1" gutterBottom>
          Mentor Match
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.name}
        </Typography>
      </Box>
      <Divider />
      <List component="nav" sx={{ px: 1 }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
    </Drawer>
  );
};

export default Sidebar;