import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useGetUserStatisticsQuery } from '../../services/api';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import EmptyState from '../feedback/EmptyState';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'primary' | 'success' | 'warning' | 'info';
}

interface Statistics {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  averageRating: number;
  // Admin specific stats
  totalMentors?: number;
  totalMentees?: number;
  activeMatches?: number;
  matchSuccessRate?: number;
  pendingApprovals?: number;
}

interface DashboardStatsProps {
  userRole: 'admin' | 'mentor' | 'mentee';
  timeRange?: 'week' | 'month' | 'year' | 'all';
}

interface StatisticsResponse {
  data: Statistics;
  status: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Box
      sx={{
        p: 1,
        borderRadius: 1,
        bgcolor: `${color}.light`,
        color: `${color}.main`,
        display: 'flex',
      }}
    >
      <Icon />
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6">
        {value}
      </Typography>
    </Box>
  </Paper>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ userRole, timeRange = 'all' }) => {
  const { data: statistics, isLoading, error } = useGetUserStatisticsQuery();

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    }),
  };

  const stats = useMemo(() => {
    const data = (statistics as StatisticsResponse)?.data || {
      totalSessions: 0,
      completedSessions: 0,
      upcomingSessions: 0,
      averageRating: 0,
      totalMentors: 0,
      totalMentees: 0,
      activeMatches: 0,
      matchSuccessRate: 0,
      pendingApprovals: 0,
    };

    const baseStats = [
      {
        title: "Total Sessions",
        value: data.totalSessions,
        icon: TrendingUpIcon,
        color: "primary" as const
      },
      {
        title: "Completed",
        value: data.completedSessions,
        icon: CheckCircleIcon,
        color: "success" as const
      },
      {
        title: "Upcoming",
        value: data.upcomingSessions,
        icon: AccessTimeIcon,
        color: "warning" as const
      },
      {
        title: "Average Rating",
        value: data.averageRating.toFixed(1),
        icon: GroupIcon,
        color: "info" as const
      }
    ];

    if (userRole === 'admin') {
      return [
        ...baseStats,
        {
          title: "Total Mentors",
          value: data.totalMentors,
          icon: GroupIcon,
          color: "primary" as const
        },
        {
          title: "Active Matches",
          value: data.activeMatches,
          icon: CheckCircleIcon,
          color: "success" as const
        },
        {
          title: "Success Rate",
          value: `${(data.matchSuccessRate * 100).toFixed(1)}%`,
          icon: TrendingUpIcon,
          color: "info" as const
        },
        {
          title: "Pending Approvals",
          value: data.pendingApprovals,
          icon: AccessTimeIcon,
          color: "warning" as const
        },
      ];
    }

    return baseStats;
  }, [statistics]);

  if (isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={TrendingUpIcon}
        title="Error Loading Statistics"
        description="There was a problem loading your statistics. Please try again later."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid key={stat.title} item xs={12} sm={6} md={3}>
            <motion.div
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardStats;
