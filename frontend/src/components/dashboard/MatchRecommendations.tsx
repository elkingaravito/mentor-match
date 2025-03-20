import { Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, Box, Rating } from '@mui/material';
import { useGetMentorMatchesQuery } from '../../services/api';

const MatchRecommendations = () => {
  const { data: matchesData, isLoading } = useGetMentorMatchesQuery();

  if (isLoading) {
    return <Typography>Loading recommendations...</Typography>;
  }

  const matches = matchesData?.data || [];
  const pendingMatches = matches
    .filter(match => match.status === 'pending')
    .sort((a, b) => b.score - a.score);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Recommended Matches
        </Typography>
        <Button variant="outlined" size="small">
          View All
        </Button>
      </Box>

      {pendingMatches.length === 0 ? (
        <Typography color="text.secondary">No recommendations available</Typography>
      ) : (
        <List>
          {pendingMatches.slice(0, 3).map((match) => (
            <ListItem key={match.id}>
              <ListItemAvatar>
                <Avatar>{match.mentorId.toString()[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`Mentor #${match.mentorId}`}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={match.score / 20} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {(match.score).toFixed(0)}% Match
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default MatchRecommendations;