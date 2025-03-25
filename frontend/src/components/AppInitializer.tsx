import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './feedback/LoadingScreen';
import { baseApi } from '../services/baseApi';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (import.meta.env.DEV) {
        console.group('App Initialization');
        console.log('Initial State:', {
          authLoading,
          isAuthenticated,
          user,
          isInitialized
        });
      }

      try {
        // Reset API cache on initialization
        dispatch(baseApi.util.resetApiState());

        if (isAuthenticated) {
          if (import.meta.env.DEV) {
            console.log('Starting data prefetch...');
          }

          // Pre-fetch critical data with individual error handling
          const prefetchPromises = [
            dispatch(baseApi.endpoints.getUserStatistics.initiate())
              .unwrap()
              .catch(error => {
                console.error('Failed to fetch statistics:', error);
                return null;
              }),
            dispatch(baseApi.endpoints.getNotifications.initiate())
              .unwrap()
              .catch(error => {
                console.error('Failed to fetch notifications:', error);
                return null;
              })
          ];

          const results = await Promise.all(prefetchPromises);

          if (import.meta.env.DEV) {
            console.log('Prefetch results:', {
              statistics: results[0],
              notifications: results[1]
            });
          }
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setIsInitialized(true);
        if (import.meta.env.DEV) {
          console.log('App initialization completed');
          console.groupEnd();
        }
      }
    };

    // Only initialize once when auth is ready
    if (!authLoading && !isInitialized) {
      initializeApp();
    }

    // Cleanup function
    return () => {
      if (import.meta.env.DEV) {
        console.log('AppInitializer cleanup');
      }
    };
  }, [authLoading, isAuthenticated, user, dispatch, isInitialized]);

  // Show loading screen with appropriate messages
  if (authLoading || !isInitialized) {
    let message = "Loading...";
    let subMessage = undefined;
    let progress = undefined;

    if (authLoading) {
      message = "Authenticating...";
      subMessage = "Verifying your credentials";
      progress = 30;
    } else if (!isInitialized) {
      message = "Initializing application...";
      subMessage = "Loading your dashboard";
      progress = 70;
    }

    return (
      <LoadingScreen 
        message={message}
        subMessage={subMessage}
        progress={progress}
      />
    );
  }

  return <>{children}</>;
};
