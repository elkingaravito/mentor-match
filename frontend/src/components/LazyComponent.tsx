import React from 'react';
import LoadingScreen from './feedback/LoadingScreen';
import ErrorScreen from './feedback/ErrorScreen';
import ErrorBoundary from './ErrorBoundary';

interface LazyComponentProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({ component }) => {
  const Component = React.lazy(component);
  
  return (
    <React.Suspense fallback={<LoadingScreen />}>
      <ErrorBoundary fallback={<ErrorScreen />}>
        <Component />
      </ErrorBoundary>
    </React.Suspense>
  );
};
