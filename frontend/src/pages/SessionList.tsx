import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Avatar, CircularProgress } from '@mui/material';
import { useGetSessionsQuery } from '../services/api';

const SessionList: React.FC = () => {
  const { data: sessions, isLoading } = useGetSessionsQuery();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lista de Sesiones
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : sessions && sessions.length > 0 ? (
        <List>
          {sessions.map((session) => (
            <ListItem key={session.id}>
              <Avatar sx={{ mr: 2 }}>
                <EventIcon />
              </Avatar>
              <ListItemText
                primary={`Sesión con ${session.mentor_name}`}
                secondary={`Fecha: ${new Date(session.start_time).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No hay sesiones disponibles.</Typography>
      )}
    </Box>
  );
};

export default SessionList;