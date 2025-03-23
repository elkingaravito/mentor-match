import { Box, Button, Container, Grid, Typography, Card, CardContent, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { FadeIn, SlideIn, ScaleIn } from '../components/animations';

const features = [
  {
    icon: <SchoolIcon sx={{ fontSize: 40 }} />,
    title: 'Expert Mentorship',
    description: 'Connect with experienced professionals in your field who can guide your career path.',
  },
  {
    icon: <GroupIcon sx={{ fontSize: 40 }} />,
    title: 'Perfect Match',
    description: 'Our intelligent matching system pairs you with mentors based on your goals and interests.',
  },
  {
    icon: <TimelineIcon sx={{ fontSize: 40 }} />,
    title: 'Track Progress',
    description: 'Set goals and track your progress with structured mentorship programs.',
  },
  {
    icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
    title: 'Flexible Schedule',
    description: 'Schedule sessions at your convenience with our easy-to-use calendar system.',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <SlideIn direction="left">
                <Typography variant="h2" component="h1" gutterBottom>
                  Find Your Perfect Mentor
                </Typography>
                <Typography variant="h5" paragraph>
                  Connect with experienced mentors who can guide you on your professional journey.
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    size="large"
                    onClick={() => navigate('/register')}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    size="large"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </Stack>
              </SlideIn>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="/hero-image.svg" 
                alt="Mentorship"
                sx={{ 
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  display: 'block',
                  margin: 'auto',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <FadeIn delay={0.3}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Why Choose Mentor Match?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 2,
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </FadeIn>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h4" gutterBottom>
              Ready to Start Your Journey?
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              Join our community of mentors and mentees today.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mt: 2 }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
