import React from 'react';
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
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetMentorsQuery } from '../../services/api';
import EmptyState from '../../components/feedback/EmptyState';
import { People as PeopleIcon } from '@mui/icons-material';

const MentorList: React.FC = () => {
  const { data: mentors, isLoading, error } = useGetMentorsQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={PeopleIcon}
        title="Error Loading Mentors"
        description="There was a problem loading the mentors list. Please try again."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!mentors?.length) {
    return (
      <EmptyState
        icon={PeopleIcon}
        title="No Mentors Found"
        description="We couldn't find any mentors matching your criteria."
        actionLabel="Modify Search"
        onAction={() => navigate('/mentors/search')}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Available Mentors
      </Typography>
      <Grid container spacing={3}>
        {mentors.map((mentor) => (
          <Grid item xs={12} sm={6} md={4} key={mentor.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={mentor.avatar} 
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">
                      {mentor.name}
                    </Typography>
                    <Typography color="textSecondary">
                      {mentor.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  {mentor.skills.map((skill) => (
                    <Chip 
                      key={skill} 
                      label={skill} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {mentor.bio}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  onClick={() => navigate(`/mentors/${mentor.id}`)}
                >
                  View Profile
                </Button>
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={() => navigate(`/sessions/schedule?mentorId=${mentor.id}`)}
                >
                  Schedule Session
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MentorList;