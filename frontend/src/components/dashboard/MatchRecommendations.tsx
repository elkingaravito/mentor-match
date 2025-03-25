import React, { useMemo, useCallback } from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Button, 
  Box, 
  Rating,
  CircularProgress 
} from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetMentorMatchesQuery } from '../../services/api';
import EmptyState from '../feedback/EmptyState';

interface Match {
  id: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'rejected';
  score: number;
}

interface MatchesResponse {
  data: Match[];
  status: string;
}

const MatchRecommendations: React.FC = () => {
  // Styles
  const styles = {
    container: {
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 2
    },
    loadingContainer: {
      p: 2,
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px'
    },
    listItem: {
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
      },
      borderRadius: 1,
      mb: 1
    },
    matchScore: {
      display: 'flex',
      alignItems: 'center',
      gap: 1
    }
  };

  // Navigation
  const navigate = useNavigate();
  
  // Data fetching - this hook must be called unconditionally
  const { data: matchesData, isLoading, error } = useGetMentorMatchesQuery();
  
  // Memoized data processing - always call these hooks
  const pendingMatches = useMemo(() => {
    const matches = (matchesData as MatchesResponse)?.data || [];
    return matches
      .filter(match => match.status === 'pending')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [matchesData]);

  // Handlers - always define these callbacks
  const handleViewAll = useCallback(() => {
    navigate('/matches');
  }, [navigate]);

  const handleUpdatePreferences = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const handleNavigateToMatch = useCallback((matchId: string) => {
    navigate(`/matches/${matchId}`);
  }, [navigate]);

  // Rendering logic 
  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (error) {
      return (
        <EmptyState
          icon={PeopleIcon}
          title="Error Loading Matches"
          description="There was a problem loading your matches. Please try again later."
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      );
    }

    if (pendingMatches.length === 0) {
      return (
        <EmptyState
          icon={PeopleIcon}
          title="No Matches Yet"
          description="We're working on finding the perfect mentor match for you."
          actionLabel="Update Preferences"
          onAction={handleUpdatePreferences}
        />
      );
    }

    return (
      <>
        <Box sx={styles.header}>
          <Typography variant="h6" component="h2">
            Recommended Matches
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleViewAll}
          >
            View All
          </Button>
        </Box>

        <List sx={{ p: 0 }}>
          {pendingMatches.map((match) => (
            <ListItem 
              key={match.id}
              sx={styles.listItem}
              button
              onClick={() => handleNavigateToMatch(match.id)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {match.mentorId.toString()[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`Mentor #${match.mentorId}`}
                secondary={
                  <Box sx={styles.matchScore}>
                    <Rating 
                      value={match.score / 20} 
                      readOnly 
                      size="small"
                      precision={0.5}
                    />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      component="span"
                    >
                      {(match.score).toFixed(0)}% Match
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </>
    );
  };

  // Main render - always return a Paper component
  return (
    <Paper sx={styles.container}>
      {renderContent()}
    </Paper>
  );
};

export default MatchRecommendations;