import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
  blur?: boolean;
  transparent?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message,
  blur = true,
  transparent = false,
}) => {
  const theme = useTheme();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: transparent
              ? 'rgba(255, 255, 255, 0.5)'
              : theme.palette.background.paper,
            backdropFilter: blur ? 'blur(4px)' : undefined,
            zIndex: theme.zIndex.modal,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <CircularProgress size={40} />
            </motion.div>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {message}
                </Typography>
              </motion.div>
            )}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;