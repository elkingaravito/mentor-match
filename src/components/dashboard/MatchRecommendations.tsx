import React from 'react';
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
import { Person as PersonIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Match {
  mentor_id?: number;
  mentee_id?: number;
  name: string;
  position?: string;
  company?: string;
  current_position?: string;
  total_score: number;
}

interface MatchRecommendationsProps {
  matches: Match[] | undefined;
  isLoading: boolean;
  userRole: string;
}

export const MatchRecommendations: React.FC<MatchRecommendationsProps> = ({
  matches,
  isLoading,
  userRole
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {userRole === 'mentee' ? 'Mentores Recomendados' : 'Mentiles Recomendados'}
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : matches && matches.length > 0 ? (
          <List>
            {matches.slice(0, 3).map((match) => (
              <ListItem key={userRole === 'mentee' ? match.mentor_id : match.mentee_id}>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={match.name}
                  secondary={userRole === 'mentee' 
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
  );
};