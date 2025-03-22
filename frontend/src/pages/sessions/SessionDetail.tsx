import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useGetSessionQuery } from '../services/api';

const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: session, isLoading } = useGetSessionQuery(Number(id));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Detalles de la Sesión
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : session ? (
        <Box>
          <Typography variant="h6">Mentor: {session.mentor_name}</Typography>
          <Typography variant="body1">Fecha: {new Date(session.start_time).toLocaleString()}</Typography>
          <Typography variant="body1">Duración: {session.duration} minutos</Typography>
          <Typography variant="body1">Estado: {session.status}</Typography>
        </Box>
      ) : (
        <Typography>No se encontró la sesión.</Typography>
      )}
    </Box>
  );
};

export default SessionDetail;