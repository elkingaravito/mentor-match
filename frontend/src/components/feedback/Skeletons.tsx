import React from 'react';
import { Box, Skeleton, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

// Card Skeleton
export const CardSkeleton: React.FC<{ height?: number }> = ({ height = 200 }) => (
  <Paper
    component={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    sx={{ p: 2, height }}
  >
    <Skeleton variant="rectangular" width="100%" height={height * 0.4} />
    <Box sx={{ pt: 2 }}>
      <Skeleton width="60%" height={28} />
      <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
    </Box>
  </Paper>
);

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => (
  <Box
    component={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}
  >
    <Skeleton variant="circular" width={40} height={40} />
    <Box sx={{ flex: 1 }}>
      <Skeleton width="70%" height={24} />
      <Skeleton width="40%" height={20} />
    </Box>
    <Skeleton width={60} height={32} />
  </Box>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns: number }> = ({ columns }) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    sx={{ display: 'flex', gap: 2, py: 1 }}
  >
    {Array(columns).fill(0).map((_, index) => (
      <Skeleton
        key={index}
        width={`${100 / columns}%`}
        height={24}
      />
    ))}
  </Box>
);

// Form Skeleton
export const FormSkeleton: React.FC = () => (
  <Box
    component={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
  >
    <Skeleton height={48} />
    <Skeleton height={48} />
    <Skeleton height={96} />
    <Skeleton height={48} width="30%" />
  </Box>
);

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => (
  <Box
    component={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
      <Skeleton variant="circular" width={120} height={120} />
      <Box sx={{ flex: 1 }}>
        <Skeleton height={32} width="40%" />
        <Skeleton height={24} width="60%" sx={{ mt: 1 }} />
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Skeleton width={100} height={32} />
          <Skeleton width={100} height={32} />
        </Box>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Skeleton height={48} />
      <Skeleton height={48} />
      <Skeleton height={96} />
    </Box>
  </Box>
);

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          md: '1fr 1fr 1fr 1fr',
        },
        gap: 2,
      }}
    >
      {Array(4).fill(0).map((_, index) => (
        <Paper
          key={index}
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Skeleton width={80} height={20} />
          <Skeleton width={60} height={32} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton width={40} height={16} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

// Grid Skeleton
export const GridSkeleton: React.FC<{
  items?: number;
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
}> = ({
  items = 6,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
}) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: `repeat(${columns.xs || 1}, 1fr)`,
        sm: `repeat(${columns.sm || 2}, 1fr)`,
        md: `repeat(${columns.md || 3}, 1fr)`,
        lg: `repeat(${columns.lg || 4}, 1fr)`,
      },
      gap: 2,
    }}
  >
    {Array(items).fill(0).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </Box>
);

// Chat Skeleton
export const ChatSkeleton: React.FC = () => (
  <Box
    component={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}
  >
    {Array(5).fill(0).map((_, index) => (
      <Box
        key={index}
        sx={{
          display: 'flex',
          flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
          gap: 1,
        }}
      >
        <Skeleton variant="circular" width={32} height={32} />
        <Box
          sx={{
            maxWidth: '70%',
            p: 1,
            borderRadius: 2,
            bgcolor: theme => index % 2 === 0
              ? theme.palette.grey[100]
              : theme.palette.primary.light,
          }}
        >
          <Skeleton width={200} height={20} />
          <Skeleton width={100} height={16} />
        </Box>
      </Box>
    ))}
  </Box>
);