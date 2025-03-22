import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { LazyRoute } from './components/LazyRoute';
import LoadingScreen from './components/feedback/LoadingScreen';

const LoadingFallback = () => <LoadingScreen />;

// Componente de ruta protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente de ruta pública
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicLayout />}>
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LazyRoute path="Landing" />}
          />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LazyRoute path="Login" />}
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LazyRoute path="Register" />}
          />
        </Route>

        {/* Rutas protegidas */}
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
          <Route path="/dashboard" element={<LazyRoute path="Dashboard" />} />
          <Route path="/profile" element={<LazyRoute path="Profile" />} />
          <Route path="/notifications" element={<LazyRoute path="Notifications" />} />
          
          {/* Rutas de Mentores */}
          <Route path="/mentors">
            <Route index element={<LazyRoute path="mentors/MentorList" />} />
            <Route path="search" element={<LazyRoute path="mentors/MentorSearch" />} />
            <Route path=":id" element={<LazyRoute path="mentors/MentorDetail" />} />
          </Route>
          
          {/* Rutas de Calendario y Analytics */}
          <Route path="/calendar" element={<LazyRoute path="CalendarPage" />} />
          <Route path="/admin/calendar" element={<LazyRoute path="AdminCalendarPage" />} />
          <Route path="/analytics" element={<LazyRoute path="AnalyticsDashboard" />} />
          <Route path="/statistics" element={<LazyRoute path="StatisticsPage" />} />
          
          {/* Rutas de Mensajes */}
          <Route path="/messages">
            <Route index element={<LazyRoute path="messages/MessageList" />} />
            <Route path=":id" element={<LazyRoute path="messages/MessageDetail" />} />
          </Route>

          {/* Rutas de Configuración */}
          <Route path="/settings">
            <Route index element={<LazyRoute path="settings/Settings" />} />
            <Route path="notifications" element={<LazyRoute path="settings/NotificationSettings" />} />
            <Route path="profile" element={<LazyRoute path="settings/ProfileSettings" />} />
          </Route>
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<LazyRoute path="NotFound" />} />
      </Routes>
    </React.Suspense>
  );
};
