import React, { useState, useEffect, useMemo } from 'react';
import { Paper, Typography, Button, Stack, Box } from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Message as MessageIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/Toast';

// Types
type UserRole = 'mentor' | 'mentee' | 'admin';

interface QuickAction {
  title: string;
  icon: React.ComponentType;
  path: string;
  color: 'primary' | 'secondary' | 'info';
}

// Component
const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Get user role
  const userRole = user?.role as UserRole || 'mentee';

  // Define actions based on role
  const actions = useMemo(() => {
    const baseActions: QuickAction[] = [
      {
        title: 'Find a Mentor',
        icon: SearchIcon,
        path: '/mentors',
        color: 'primary',
      },
      {
        title: 'Messages',
        icon: MessageIcon,
        path: '/messages',
        color: 'info',
      },
      {
        title: 'Settings',
        icon: SettingsIcon,
        path: '/settings',
        color: 'secondary',
      }
    ];

    if (userRole === 'admin') {
      return [
        {
          title: 'Manage Mentors',
          icon: GroupIcon,
          path: '/admin/mentors',
          color: 'primary',
        },
        {
          title: 'Review Matches',
          icon: CheckCircleIcon,
          path: '/admin/matches',
          color: 'secondary',
        },
        {
          title: 'System Settings',
          icon: SettingsIcon,
          path: '/admin/settings',
          color: 'info',
        }
      ];
    }

    if (userRole === 'mentor') {
      baseActions.push({
        title: 'My Mentees',
        icon: GroupIcon,
        path: '/mentees',
        color: 'primary',
      });
    } else {
      baseActions.push({
        title: 'Schedule Session',
        icon: CalendarIcon,
        path: '/calendar',
        color: 'secondary',
      });
    }

    return baseActions;
  }, [userRole]);

  // Navigation handler
  const handleNavigate = (path: string) => {
    if (path.startsWith('/admin') && userRole !== 'admin') {
      showToast('You do not have permission to access this section', 'error');
      return;
    }
    navigate(path);
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Paper 
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Quick Actions
      </Typography>
      
      <Box sx={{ flex: 1 }}>
        <Stack spacing={2}>
          {isLoading ? (
            // Loading state
            Array(3).fill(0).map((_, index) => (
              <Box 
                key={index} 
                sx={{ 
                  height: 48, 
                  bgcolor: 'action.hover', 
                  borderRadius: 1 
                }}
              />
            ))
          ) : (
            // Actions buttons
            actions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outlined"
                    color={action.color}
                    startIcon={<Icon />}
                    onClick={() => handleNavigate(action.path)}
                    fullWidth
                  >
                    {action.title}
                  </Button>
                </motion.div>
              );
            })
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default QuickActions;