import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Event as EventIcon,
  Handshake as HandshakeIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  userRole: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ userRole }) => {
  const navigate = useNavigate();

  return (
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
              Buscar {userRole === 'mentee' ? 'Mentor' : 'Mentil'}
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
  );
};