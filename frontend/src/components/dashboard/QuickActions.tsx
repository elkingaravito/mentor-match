import { Paper, Typography, Button, Stack, Box } from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useCallback } from 'react';

interface QuickAction {
  title: string;
  icon: React.ComponentType;
  path: string;
  color: 'primary' | 'secondary' | 'info';
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const
    },
    button: {
      position: 'relative',
      overflow: 'hidden',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
        transform: 'translateX(-100%)',
        transition: 'transform 0.3s',
      },
      '&:hover::after': {
        transform: 'translateX(100%)',
      },
    }
  };

  const actions: QuickAction[] = useMemo(() => {
  const baseActions = [
    {
      title: 'Find a Mentor',
      icon: SearchIcon,
      path: '/mentors',
      color: 'primary',
    },
    {
      title: 'Schedule Session',
      icon: CalendarIcon,
      path: '/calendar',
      color: 'secondary',
    },
    {
      title: 'Send Message',
      icon: MessageIcon,
      path: '/messages',
      color: 'info',
    },
  ];

  const adminActions: QuickAction[] = [
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
    },
  ];

  return userRole === 'admin' ? adminActions : baseActions;
}, [userRole]);

  const handleNavigate = useCallback((path: string) => {
    if (path.startsWith('/admin') && userRole !== 'admin') {
      toast.error('No tienes permisos para acceder a esta sección');
      return;
    }
    navigate(path);
  }, [navigate, userRole]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const buttonVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <Paper 
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={styles.container}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Quick Actions
      </Typography>
      <Box sx={{ flex: 1 }}>
        <Stack 
          spacing={2}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant="outlined"
                    color={action.color}
                    startIcon={
                      <motion.div
                        initial={{ rotate: 0 }}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon />
                      </motion.div>
                    }
                    onClick={() => handleNavigate(action.path)}
                    fullWidth
                    sx={styles.button}
                  >
                    {action.title}
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Stack>
      </Box>
    </Paper>
  );
};

export default QuickActions;
