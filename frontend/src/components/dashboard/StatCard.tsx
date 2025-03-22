import { Paper, Typography, Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { memo } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = memo(({ 
  title, 
  value, 
  icon: Icon, 
  color,
  subtitle 
}) => {
  const theme = useTheme();
  const styles = {
    card: {
      p: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: theme.shadows[4],
        transform: 'translateY(-2px)',
      }
    },
    iconContainer: {
      p: 1.5,
      borderRadius: 2,
      bgcolor: `${color}.light`,
      color: `${color}.main`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
    },
    value: {
      fontWeight: 'bold',
      color: theme.palette.text.primary,
    },
    subtitle: {
      fontSize: '0.75rem',
      color: theme.palette.text.secondary,
      mt: 0.5,
    }
  };

  const variants = {
    icon: {
      initial: { scale: 0, rotate: -180 },
      animate: { 
        scale: 1,
        rotate: 0,
        transition: {
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }
      },
    },
    number: {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1,
        y: 0,
        transition: {
          delay: 0.2,
          duration: 0.5,
        }
      },
    },
    card: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { 
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
        }
      },
      hover: {
        scale: 1.02,
        transition: {
          duration: 0.2,
        }
      }
    }
  };

  return (
    <motion.div
      variants={variants.card}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      <Paper sx={styles.card}>
        <motion.div
          variants={variants.icon}
          initial="initial"
          animate="animate"
        >
          <Box sx={styles.iconContainer}>
            <Icon />
          </Box>
        </motion.div>
        <Box sx={styles.content}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <motion.div
            variants={variants.number}
            initial="initial"
            animate="animate"
          >
            <Typography variant="h6" sx={styles.value}>
              {value}
            </Typography>
          </motion.div>
          {subtitle && (
            <Typography sx={styles.subtitle}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
