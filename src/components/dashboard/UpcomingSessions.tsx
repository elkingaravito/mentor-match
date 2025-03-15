import React from 'react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { UpcomingSessions } from '../components/dashboard/UpcomingSessions';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Session {
  id: number;
  mentor_id: number;
  mentee_id: number;
  start_time: string;
  status: string;
}

interface UpcomingSessionsProps {
  sessions: Session[] | undefined;
  isLoading: boolean;
  userRole: string;
}

export const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({
  sessions,
  isLoading,
  userRole
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Próximas Sesiones
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : upcomingSessions && upcomingSessions.length > 0 ? (
          <List>
            {upcomingSessions.map((session) => (
              <ListItem key={session.id}>
                <ListItemAvatar>
                  <Avatar>
                    <EventIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`Sesión con ${userRole === 'mentor' ? 'Mentil' : 'Mentor'} #${userRole === 'mentor' ? session.mentee_id : session.mentor_id}`}
                  secondary={new Date(session.start_time).toLocaleString()}
                />
                <Chip
                  label="Ver detalles"
                  color="primary"
                  size="small"
                  onClick={() => navigate(`/sessions/${session.id}`)}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No hay sesiones programadas</Typography>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => navigate('/sessions')}>
          Ver todas las sesiones
        </Button>
      </CardActions>
    </Card>
  );
};
