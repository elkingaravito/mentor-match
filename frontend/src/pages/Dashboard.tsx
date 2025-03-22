import { Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/animations';
import DashboardStats from '../components/dashboard/DashboardStats';
import QuickActions from '../components/dashboard/QuickActions';
import NotificationsList from '../components/dashboard/NotificationsList';
import UpcomingSessions from '../components/dashboard/UpcomingSessions';
import MatchRecommendations from '../components/dashboard/MatchRecommendations';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

const Dashboard = () => {
  return (
    <PageTransition>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <DashboardStats />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <QuickActions />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <NotificationsList />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <UpcomingSessions />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <MatchRecommendations />
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </PageTransition>
  );
};

export default Dashboard;
