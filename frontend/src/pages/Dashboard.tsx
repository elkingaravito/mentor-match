import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Event as EventIcon,
  Handshake as HandshakeIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
  useGetUserStatisticsQuery,
  useGetUserNotificationsQuery,
  useGetMenteeMatchesQuery,
  useGetMentorMatchesQuery,
  useGetSessionsQuery,
} from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: userStats, isLoading: isLoadingStats } = useGetUserStatisticsQuery(user?.id || 0, {
    skip: !user,
  });
  
  const { data: notifications, isLoading: isLoadingNotifications } = useGetUserNotificationsQuery(user?.id || 0, {
    skip: !user,
  });
  
  const { data: menteeMatches, isLoading: isLoadingMenteeMatches } = useGetMenteeMatchesQuery(user?.id || 0, {
    skip: !user || user.role !== 'mentee',
  });
  
  const { data: mentorMatches, isLoading: isLoadingMentorMatches } = useGetMentorMatchesQuery(user?.id || 0, {
    skip: !user || user.role !== 'mentor',
  });
  
  const { data: sessions, isLoading: isLoadingSessions } = useGetSessionsQuery(undefined, {
    skip: !user,
  });
  
  const upcomingSessions = sessions?.filter(session => 
    new Date(session.start_time) > new Date() && session.status === 'scheduled'
  ).slice(0, 3);
  
  const unreadNotifications = notifications?.filter(n => !n.read).slice(0, 3);
  
  const matches = user?.role === 'mentee' ? menteeMatches : mentorMatches;
  const isLoadingMatches = user?.role === 'mentee' ? isLoadingMenteeMatches : isLoadingMentorMatches;
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Estadísticas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mis Estadísticas
              </Typography>
              
              {isLoadingStats ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : userStats ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Sesiones completadas
                    </Typography>
                    <Typography variant="h4">
                      {userStats.sessions.completed}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Horas de mentoría
                    </Typography>
                    <Typography variant="h4">
                      {userStats.mentoring_hours}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Sesiones programadas
                    </Typography>
                    <Typography variant="h4">
                      {userStats.sessions.upcoming}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Calificación promedio
                    </Typography>
                    <Typography variant="h4">
                      {userStats.average_rating.toFixed(1)}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Typography>No hay estadísticas disponibles</Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/statistics')}>
                Ver más estadísticas
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Próximas sesiones */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Próximas Sesiones
              </Typography>
              
              {isLoadingSessions ? (
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
                        primary={`Sesión con ${user?.role === 'mentor' ? 'Mentil' : 'Mentor'} #${user?.role === 'mentor' ? session.mentee_id : session.mentor_id}`}
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
        </Grid>
        
        {/* Notificaciones */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notificaciones Recientes
              </Typography>
              
              {isLoadingNotifications ? (
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
        </Grid>
        
        {/* Matches recomendados */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {user?.role === 'mentee' ? 'Mentores Recomendados' : 'Mentiles Recomendados'}
              </Typography>
              
              {isLoadingMatches ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : matches && matches.length > 0 ? (
                <List>
                  {matches.slice(0, 3).map((match) => (
                    <ListItem key={user?.role === 'mentee' ? match.mentor_id : match.mentee_id}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={match.name}
                        secondary={user?.role === 'mentee' 
                          ? `${match.position} en ${match.company}`
                          : match.current_position
                        }
                      />
                      <Chip
                        label={`${Math.round(match.total_score * 100)}% compatible`}
                        color="primary"
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No hay recomendaciones disponibles</Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/matchmaking')}>
                Ver todos los matches
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Acciones rápidas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PersonIcon />}
                    onClick={() => navigate('/profile')}
                    sx={{ height: '100%' }}
                  >
                    Mi Perfil
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CalendarIcon />}
                    onClick={() => navigate('/calendar')}
                    sx={{ height: '100%' }}
                  >
                    Mi Calendario
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<HandshakeIcon />}
                    onClick={() => navigate('/matchmaking')}
                    sx={{ height: '100%' }}
                  >
                    Buscar {user?.role === 'mentee' ? 'Mentor' : 'Mentil'}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/sessions')}
                    sx={{ height: '100%' }}
                  >
                    Mis Sesiones
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
