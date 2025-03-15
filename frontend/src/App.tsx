import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MentorList from './pages/MentorList';
import MenteeList from './pages/MenteeList';
import SessionList from './pages/SessionList';
import SessionDetail from './pages/SessionDetail';
import MatchmakingPage from './pages/MatchmakingPage';
import CalendarPage from './pages/CalendarPage';
import StatisticsPage from './pages/StatisticsPage';
import NotificationsPage from './pages/NotificationsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex' }}>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mentors" element={<MentorList />} />
            <Route path="/mentees" element={<MenteeList />} />
            <Route path="/sessions" element={<SessionList />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/matchmaking" element={<MatchmakingPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Box>
  );
};

export default App;
