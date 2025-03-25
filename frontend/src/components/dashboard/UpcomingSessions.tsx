import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Button, 
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Event as EventIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useGetSessionsQuery } from '../../services/api';
import EmptyState from '../feedback/EmptyState';
import { useMemo, useCallback } from 'react';

interface Session {
  id: string;
  mentorId: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  title: string;
}

interface SessionsResponse {
  data: Session[];
  status: string;
}

const UpcomingSessions: React.FC = () => {
  const navigate = useNavigate();
  const { data: sessionsData, isLoading, error } = useGetSessionsQuery();

  const styles = {
    container: {
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 2
    },
    listItem: {
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
      },
      borderRadius: 1,
      mb: 1
    }
  };

  const handleViewAll = useCallback(() => {
    navigate('/sessions');
  }, [navigate]);

  const handleScheduleSession = useCallback(() => {
    navigate('/calendar');
  }, [navigate]);

  const upcomingSessions = useMemo(() => {
    const sessions = (sessionsData as SessionsResponse)?.data || [];
    return sessions
      .filter(session => session.status === 'scheduled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  }, [sessionsData]);

  if (isLoading || error) {
    return (
      <EmptyState
        icon={EventIcon}
        title={isLoading ? "Loading Sessions" : "Error Loading Sessions"}
        description={
          isLoading 
            ? "Please wait while we fetch your upcoming sessions..." 
            : "There was a problem loading your sessions. Please try again later."
        }
        loading={isLoading}
        error={!!error}
        retry={() => window.location.reload()}
      />
    );
  }

  if (upcomingSessions.length === 0) {
    return (
      <EmptyState
        icon={EventIcon}
        title="No Upcoming Sessions"
        description="You don't have any sessions scheduled. Why not book one now?"
        actionLabel="Schedule Session"
        onAction={handleScheduleSession}
        variant="card"
      />
    );
  }

  return (
    <Paper 
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={styles.container}
    >
      <Box sx={styles.header}>
        <Typography variant="h6" component="h2">
          Upcoming Sessions
        </Typography>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleViewAll}
        >
          View All
        </Button>
      </Box>

      <List sx={{ p: 0 }}>
        {upcomingSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ListItem 
              sx={styles.listItem}
              button
              onClick={() => navigate(`/sessions/${session.id}`)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {session.mentorId.toString()[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={session.title || `Session with Mentor #${session.mentorId}`}
                secondary={format(new Date(session.startTime), 'PPp')}
              />
            </ListItem>
          </motion.div>
        ))}
      </List>
    </Paper>
  );
};

export default UpcomingSessions;
