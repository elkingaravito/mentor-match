import React from 'react';
import { Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/animations';
import { useAuth } from '../context/AuthContext';
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
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
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
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    y: -5,
    transition: {
      duration: 0.2,
    },
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'mentee';
  return (
    <PageTransition mode="fade">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <motion.div 
              variants={itemVariants}
              whileHover="hover"
              layoutId="stats"
            >
              <DashboardStats userRole={userRole as 'admin' | 'mentor' | 'mentee'} />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div 
              variants={itemVariants}
              whileHover="hover"
              layoutId="quickActions"
            >
              <QuickActions />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div 
              variants={itemVariants}
              whileHover="hover"
              layoutId="notifications"
            >
              <NotificationsList />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={8}>
            <motion.div 
              variants={itemVariants}
              whileHover="hover"
              layoutId="sessions"
            >
              <UpcomingSessions />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div 
              variants={itemVariants}
              whileHover="hover"
              layoutId="matches"
            >
              <MatchRecommendations />
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </PageTransition>
  );
};

export default React.memo(Dashboard);
