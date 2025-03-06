import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Avatar, CircularProgress } from '@mui/material';
import { useGetMenteesQuery } from '../services/api';

const MenteeList: React.FC = () => {
  const { data: mentees, isLoading } = useGetMenteesQuery();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lista de Mentees
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : mentees && mentees.length > 0 ? (
        <List>
          {mentees.map((mentee) => (
            <ListItem key={mentee.id}>
              <Avatar sx={{ mr: 2 }}>{mentee.name.charAt(0)}</Avatar>
              <ListItemText
                primary={mentee.name}
                secondary={`Posición actual: ${mentee.current_position}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No hay mentees disponibles.</Typography>
      )}
    </Box>
  );
};

export default MenteeList;