import React from 'react';
import {
  Button,
  ButtonProps,
  CircularProgress,
  Box,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  loadingPosition?: 'start' | 'end' | 'center';
  success?: boolean;
  successText?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  loadingPosition = 'center',
  success = false,
  successText,
  disabled,
  children,
  startIcon,
  endIcon,
  ...props
}) => {
  const theme = useTheme();

  const getContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {loadingPosition !== 'end' && (
            <CircularProgress
              size={20}
              sx={{
                color: props.variant === 'contained' ? 'inherit' : theme.palette[props.color || 'primary'].main,
              }}
            />
          )}
          <span>{loadingText || children}</span>
          {loadingPosition === 'end' && (
            <CircularProgress
              size={20}
              sx={{
                color: props.variant === 'contained' ? 'inherit' : theme.palette[props.color || 'primary'].main,
              }}
            />
          )}
        </Box>
      );
    }

    if (success) {
      return (
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {successText || children}
        </motion.div>
      );
    }

    return (
      <>
        {startIcon}
        {children}
        {endIcon}
      </>
    );
  };

  return (
    <Button
      {...props}
      disabled={loading || disabled}
      sx={{
        position: 'relative',
        minWidth: 100,
        ...props.sx,
      }}
    >
      {getContent()}
    </Button>
  );
};

export default LoadingButton;