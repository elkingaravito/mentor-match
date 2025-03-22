import React, { Suspense } from 'react';
import LoadingScreen from './feedback/LoadingScreen';
import ErrorScreen from './feedback/ErrorScreen';
import ErrorBoundary from './ErrorBoundary';

interface LazyRouteProps {
  path: string;
}

// Mapa de rutas a componentes
const pageModules = {
  // Root pages
  'Landing': React.lazy(() => import('../pages/Landing')),
  'Login': React.lazy(() => import('../pages/Login')),
  'Register': React.lazy(() => import('../pages/Register')),
  'Dashboard': React.lazy(() => import('../pages/Dashboard')),
  'Profile': React.lazy(() => import('../pages/Profile')),
  'Notifications': React.lazy(() => import('../pages/NotificationsPage')),
  'NotFound': React.lazy(() => import('../pages/NotFound')),
  'MenteeList': React.lazy(() => import('../pages/MenteeList')),
  'MentorList': React.lazy(() => import('../pages/MentorList')),
  'MatchingPage': React.lazy(() => import('../pages/MatchingPage')),
  'MatchmakingPage': React.lazy(() => import('../pages/MatchmakingPage')),
  'CalendarPage': React.lazy(() => import('../pages/CalendarPage')),
  'AdminCalendarPage': React.lazy(() => import('../pages/AdminCalendarPage')),
  'AnalyticsDashboard': React.lazy(() => import('../pages/AnalyticsDashboard')),
  'StatisticsPage': React.lazy(() => import('../pages/StatisticsPage')),

  // Mentors
  'mentors/MentorList': React.lazy(() => import('../pages/mentors/MentorList')),
  'mentors/MentorSearch': React.lazy(() => import('../pages/mentors/MentorSearch')),
  'mentors/MentorDetail': React.lazy(() => import('../pages/mentors/MentorDetail')),

  // Messages
  'messages/MessageList': React.lazy(() => import('../pages/messages/MessageList')),
  'messages/MessageDetail': React.lazy(() => import('../pages/messages/MessageDetail')),

  // Settings
  'settings/Settings': React.lazy(() => import('../pages/settings/Settings')),
  'settings/NotificationSettings': React.lazy(() => import('../pages/settings/NotificationSettings')),
  'settings/ProfileSettings': React.lazy(() => import('../pages/settings/ProfileSettings')),
} as const;

type PagePath = keyof typeof pageModules;

export const LazyRoute = ({ path }: LazyRouteProps) => {
  const Component = pageModules[path as PagePath] || ErrorScreen;

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
};
