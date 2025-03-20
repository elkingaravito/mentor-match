import { Grid } from '@mui/material';
import DashboardStats from '../components/dashboard/DashboardStats';
import QuickActions from '../components/dashboard/QuickActions';
import NotificationsList from '../components/dashboard/NotificationsList';
import UpcomingSessions from '../components/dashboard/UpcomingSessions';
import MatchRecommendations from '../components/dashboard/MatchRecommendations';

const Dashboard = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DashboardStats />
      </Grid>
      <Grid item xs={12} md={6}>
        <QuickActions />
      </Grid>
      <Grid item xs={12} md={6}>
        <NotificationsList />
      </Grid>
      <Grid item xs={12} md={8}>
        <UpcomingSessions />
      </Grid>
      <Grid item xs={12} md={4}>
        <MatchRecommendations />
      </Grid>
    </Grid>
  );
};

export default Dashboard;