import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingScreen: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadingScreen;