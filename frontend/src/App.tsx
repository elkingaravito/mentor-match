import { useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useDispatch } from 'react-redux';

import { AppRoutes } from './routes';
import { WebSocketProvider } from './context/WebSocketContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/feedback/Toast';
import { ConfirmDialogProvider } from './components/feedback/ConfirmDialog';
import { theme } from './theme';
import ErrorBoundary from './components/ErrorBoundary';
import { AppInitializer } from './components/AppInitializer';

const AppContent: React.FC = () => {
  const dispatch = useDispatch();

  // Development logging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('App mounted');
      return () => console.log('App unmounted');
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <AuthProvider>
            <AppInitializer>
              <ToastProvider>
                <ConfirmDialogProvider>
                  <WebSocketProvider>
                    <AppRoutes />
                  </WebSocketProvider>
                </ConfirmDialogProvider>
              </ToastProvider>
            </AppInitializer>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Wrap the app in a development error boundary in dev mode
const App: React.FC = () => {
  if (import.meta.env.DEV) {
    return (
      <ErrorBoundary 
        fallback={<div>Something went wrong. Check the console for details.</div>}
        onError={(error, errorInfo) => {
          console.error('App Error:', error);
          console.error('Error Info:', errorInfo);
        }}
      >
        <AppContent />
      </ErrorBoundary>
    );
  }

  return <AppContent />;
};

export default App;
