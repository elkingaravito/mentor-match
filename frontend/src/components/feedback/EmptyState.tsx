import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
  actionLabel?: string;
  secondaryActionLabel?: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  image?: string;
  variant?: 'default' | 'compact' | 'card';
  color?: 'primary' | 'secondary' | 'info' | 'warning' | 'error';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  secondaryActionLabel,
  onAction,
  onSecondaryAction,
  image,
  variant = 'default',
  color = 'primary',
}) => {
  const theme = useTheme();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const getStyles = () => {
    const baseStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      gap: theme.spacing(2),
    };

    switch (variant) {
      case 'compact':
        return {
          ...baseStyles,
          padding: theme.spacing(2),
        };
      case 'card':
        return {
          ...baseStyles,
          padding: theme.spacing(4),
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[1],
        };
      default:
        return {
          ...baseStyles,
          padding: theme.spacing(6),
        };
    }
  };

  const content = (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={getStyles()}
    >
      {image ? (
        <motion.img
          src={image}
          alt={title}
          style={{
            width: variant === 'compact' ? 120 : 200,
            height: 'auto',
            marginBottom: theme.spacing(2),
          }}
          variants={itemVariants}
        />
      ) : (
        <motion.div
          variants={itemVariants}
          style={{
            backgroundColor: alpha(theme.palette[color].main, 0.1),
            borderRadius: '50%',
            padding: theme.spacing(2),
            marginBottom: theme.spacing(2),
          }}
        >
          <Icon
            sx={{
              fontSize: variant === 'compact' ? 40 : 64,
              color: `${color}.main`,
            }}
          />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Typography
          variant={variant === 'compact' ? 'h6' : 'h5'}
          component="h2"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          {title}
        </Typography>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 400, mb: actionLabel ? 2 : 0 }}
        >
          {description}
        </Typography>
      </motion.div>

      {(actionLabel || secondaryActionLabel) && (
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            gap: theme.spacing(2),
            marginTop: theme.spacing(2),
          }}
        >
          {actionLabel && (
            <Button
              variant="contained"
              color={color}
              onClick={onAction}
              sx={{
                minWidth: 120,
              }}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button
              variant="outlined"
              color={color}
              onClick={onSecondaryAction}
              sx={{
                minWidth: 120,
              }}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );

  return variant === 'card' ? <Paper>{content}</Paper> : content;
};

export default EmptyState;