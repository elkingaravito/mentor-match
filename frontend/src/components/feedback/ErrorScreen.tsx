import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ErrorScreenProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  onReset?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onReset }) => {
  const navigate = useNavigate();

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <ErrorIcon color="error" sx={{ fontSize: 64 }} />
        <Typography variant="h4" gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {error?.message || 'An unexpected error occurred'}
        </Typography>
        {process.env.NODE_ENV === 'development' && error && (
          <Box
            component="pre"
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              maxWidth: '100%',
              textAlign: 'left',
            }}
          >
            {error.stack}
          </Box>
        )}
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleReset}
            sx={{ mr: 2 }}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/', { replace: true })}
          >
            Go to Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ErrorScreen;
