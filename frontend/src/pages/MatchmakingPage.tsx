import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { addHours } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import {
  useGetMenteeMatchesQuery,
  useGetMentorMatchesQuery,
  useCreateSessionMutation,
} from '../services/api';

const MatchmakingPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(new Date());
  const [sessionDuration, setSessionDuration] = useState<number>(60);
  
  const { data: menteeMatches, isLoading: isLoadingMenteeMatches } = useGetMenteeMatchesQuery(user?.id || 0, {
    skip: !user || user.role !== 'mentee',
  });
  
  const { data: mentorMatches, isLoading: isLoadingMentorMatches } = useGetMentorMatchesQuery(user?.id || 0, {
    skip: !user || user.role !== 'mentor',
  });
  
  const [createSession, { isLoading: isCreatingSession }] = useCreateSessionMutation();
  
  const matches = user?.role === 'mentee' ? menteeMatches : mentorMatches;
  const isLoading = user?.role === 'mentee' ? isLoadingMenteeMatches : isLoadingMentorMatches;
  
  const handleRequestSession = (match: any) => {
    setSelectedMatch(match);
    setSessionDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setSessionDialogOpen(false);
    setSelectedMatch(null);
  };
  
  const handleCreateSession = async () => {
    if (!sessionStartTime || !selectedMatch || !user) return;
    
    const endTime = addHours(sessionStartTime, sessionDuration / 60);
    
    try {
      await createSession({
        mentor_id: user.role === 'mentee' ? selectedMatch.mentor_id : user.id,
        mentee_id: user.role === 'mentor' ? selectedMatch.mentee_id : user.id,
        start_time: sessionStartTime.toISOString(),
        end_time: endTime.toISOString(),
      }).unwrap();
      
      handleCloseDialog();
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error al crear sesión:', error);
      // Mostrar mensaje de error
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {user?.role === 'mentee' ? 'Encuentra tu Mentor Ideal' : 'Mentiles que Podrías Ayudar'}
      </Typography>
      
      <Typography variant="body1" paragraph>
        {user?.role === 'mentee'
          ? 'Basado en tus intereses y disponibilidad, te recomendamos estos mentores que podrían ayudarte a alcanzar tus objetivos.'
          : 'Estos mentiles están buscando ayuda en áreas donde tienes experiencia. ¡Ayúdalos a crecer profesionalmente!'
        }
      </Typography>
      
      {isLoading ? (
        <Box sx={{ width: '100%', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : matches && matches.length > 0 ? (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {matches.map((match) => (
            <Grid item xs={12} md={6} lg={4} key={user?.role === 'mentee' ? match.mentor_id : match.mentee_id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                      {match.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{match.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.role === 'mentee'
                          ? `${match.position} en ${match.company}`
                          : match.current_position
                        }
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Compatibilidad
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={match.total_score * 100}
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Typography variant="body2">
                      {Math.round(match.total_score * 100)}%
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {user?.role === 'mentee' ? 'Experiencia' : 'Objetivos'}
                    </Typography>
                    <Typography variant="body2">
                      {user?.role === 'mentee'
                        ? `${match.experience_years} años de experiencia`
                        : match.goals
                      }
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Detalles de compatibilidad
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label={`Perfil: ${Math.round(match.profile_compatibility * 100)}%`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Horario: ${Math.round(match.schedule_compatibility * 100)}%`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleRequestSession(match)}
                  >
                    Solicitar sesión
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" sx={{ mt: 4 }}>
          No se encontraron coincidencias. Intenta actualizar tu perfil con más información sobre tus habilidades e intereses.
        </Typography>
      )}
      
      {/* Diálogo para programar sesión */}
      <Dialog open={sessionDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Programar Sesión con {selectedMatch?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <DateTimePicker
              label="Fecha y hora de inicio"
              value={sessionStartTime}
              onChange={(newValue) => setSessionStartTime(newValue)}
              sx={{ width: '100%', mb: 3 }}
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="duration-label">Duración</InputLabel>
              <Select
                labelId="duration-label"
                value={sessionDuration}
                label="Duración"
                onChange={(e) => setSessionDuration(Number(e.target.value))}
              >
                <MenuItem value={30}>30 minutos</MenuItem>
                <MenuItem value={60}>1 hora</MenuItem>
                <MenuItem value={90}>1 hora 30 minutos</MenuItem>
                <MenuItem value={120}>2 horas</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Mensaje (opcional)"
              multiline
              rows={4}
              fullWidth
              placeholder="Describe brevemente el objetivo de la sesión..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            disabled={isCreatingSession || !sessionStartTime}
          >
            {isCreatingSession ? 'Enviando...' : 'Solicitar Sesión'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MatchmakingPage;
