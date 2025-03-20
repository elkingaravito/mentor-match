import { Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, Box } from '@mui/material';
import { useGetSessionsQuery } from '../../services/api';

const UpcomingSessions = () => {
  const { data: sessionsData, isLoading } = useGetSessionsQuery();

  if (isLoading) {
    return <Typography>Loading sessions...</Typography>;
  }

  const sessions = sessionsData?.data || [];
  const upcomingSessions = sessions
    .filter(session => session.status === 'scheduled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Upcoming Sessions
        </Typography>
        <Button variant="outlined" size="small">
          View All
        </Button>
      </Box>
      
      {upcomingSessions.length === 0 ? (
        <Typography color="text.secondary">No upcoming sessions</Typography>
      ) : (
        <List>
          {upcomingSessions.slice(0, 5).map((session) => (
            <ListItem key={session.id}>
              <ListItemAvatar>
                <Avatar>{session.mentorId.toString()[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`Session with Mentor #${session.mentorId}`}
                secondary={new Date(session.startTime).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default UpcomingSessions;