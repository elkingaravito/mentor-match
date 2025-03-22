import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AppRoutes } from './routes';
import { WebSocketProvider } from './context/WebSocketContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/feedback/Toast';
import { ConfirmDialogProvider } from './components/feedback/ConfirmDialog';
import { theme } from './theme';
import ErrorBoundary from './components/ErrorBoundary';

import { AppInitializer } from './components/AppInitializer';

const App: React.FC = () => {
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

export default App;
