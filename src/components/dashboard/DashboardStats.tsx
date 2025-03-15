import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface UserStats {
  sessions: {
    completed: number;
    upcoming: number;
  };
  mentoring_hours: number;
  average_rating: number;
}

interface DashboardStatsProps {
  stats: UserStats | undefined;
  isLoading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Mis Estadísticas
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : stats ? (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Sesiones completadas
              </Typography>
              <Typography variant="h4">
                {stats.sessions.completed}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Horas de mentoría
              </Typography>
              <Typography variant="h4">
                {stats.mentoring_hours}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Sesiones programadas
              </Typography>
              <Typography variant="h4">
                {stats.sessions.upcoming}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Calificación promedio
              </Typography>
              <Typography variant="h4">
                {stats.average_rating.toFixed(1)}
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
  );
};