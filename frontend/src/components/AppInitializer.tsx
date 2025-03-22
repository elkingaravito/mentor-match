import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './feedback/LoadingScreen';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};