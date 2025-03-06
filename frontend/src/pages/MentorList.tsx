import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Avatar, CircularProgress } from '@mui/material';
import { useGetMentorsQuery } from '../services/api';

const MentorList: React.FC = () => {
  const { data: mentors, isLoading } = useGetMentorsQuery();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lista de Mentores
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : mentors && mentors.length > 0 ? (
        <List>
          {mentors.map((mentor) => (
            <ListItem key={mentor.id}>
              <Avatar sx={{ mr: 2 }}>{mentor.name.charAt(0)}</Avatar>
              <ListItemText
                primary={mentor.name}
                secondary={`${mentor.position} en ${mentor.company}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No hay mentores disponibles.</Typography>
      )}
    </Box>
  );
};

export default MentorList;