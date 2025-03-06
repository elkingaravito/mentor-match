import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useUpdateProfileMutation } from '../services/api';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [formValues, setFormValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    linkedin_url: user?.linkedin_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        userId: user?.id || 0,
        ...formValues,
      }).unwrap();
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      // Mostrar mensaje de error
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mi Perfil
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role === 'mentor' ? 'Mentor' : 'Mentil'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={formValues.name}
                    onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Correo electrónico"
                    value={formValues.email}
                    onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Biografía"
                    value={formValues.bio}
                    onChange={(e) => setFormValues({ ...formValues, bio: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="URL de LinkedIn"
                    value={formValues.linkedin_url}
                    onChange={(e) => setFormValues({ ...formValues, linkedin_url: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;