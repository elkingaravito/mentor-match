import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  progress?: number;
  subMessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  fullScreen = true,
  progress,
  subMessage
}) => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
        gap: 2,
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <CircularProgress />
      </motion.div>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Typography
          component={motion.p}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          color="text.primary"
          variant="body1"
          fontWeight="medium"
        >
          {message}
        </Typography>
        {subMessage && (
          <Typography
            component={motion.p}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            color="text.secondary"
            variant="body2"
          >
            {subMessage}
          </Typography>
        )}
        {progress !== undefined && (
          <Box sx={{ width: '200px', mt: 2 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              style={{
                height: '4px',
                backgroundColor: 'primary.main',
                borderRadius: '2px',
              }}
              transition={{ duration: 0.3 }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LoadingScreen;
