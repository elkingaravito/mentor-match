import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useGetUserStatisticsQuery } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) => (
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

const DashboardStats = () => {
  const { data: statistics, isLoading } = useGetUserStatisticsQuery();

  if (isLoading) {
    return <Typography>Loading statistics...</Typography>;
  }

  const stats = statistics?.data || {
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    averageRating: 0,
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={TrendingUpIcon}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Completed"
          value={stats.completedSessions}
          icon={CheckCircleIcon}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Upcoming"
          value={stats.upcomingSessions}
          icon={AccessTimeIcon}
          color="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={GroupIcon}
          color="info"
        />
      </Grid>
    </Grid>
  );
};

export default DashboardStats;