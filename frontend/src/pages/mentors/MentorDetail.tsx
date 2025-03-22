import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Chip, 
  Button,
  CircularProgress,
  Divider,
  Rating
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetMentorQuery } from '../../services/api';
import EmptyState from '../../components/feedback/EmptyState';
import { Person as PersonIcon } from '@mui/icons-material';

const MentorDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: mentor, isLoading, error } = useGetMentorQuery(id);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !mentor) {
    return (
      <EmptyState
        icon={PersonIcon}
        title="Mentor Not Found"
        description="We couldn't find the mentor you're looking for."
        actionLabel="Back to Mentors"
        onAction={() => navigate('/mentors')}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src={mentor.avatar} 
                  sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  {mentor.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {mentor.title}
                </Typography>
                <Rating value={mentor.rating} readOnly precision={0.5} />
                <Typography variant="body2" color="textSecondary">
                  {mentor.totalReviews} reviews
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography paragraph>
                {mentor.bio}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Expertise
              </Typography>
              <Box sx={{ mb: 2 }}>
                {mentor.skills.map((skill) => (
                  <Chip 
                    key={skill} 
                    label={skill} 
                    sx={{ mr: 0.5, mb: 0.5 }} 
                  />
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Experience
              </Typography>
              <Typography paragraph>
                {mentor.experience}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate(`/sessions/schedule?mentorId=${id}`)}
                  sx={{ mr: 2 }}
                >
                  Schedule Session
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate(`/messages/new?recipientId=${id}`)}
                >
                  Send Message
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MentorDetail;