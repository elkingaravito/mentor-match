import React from 'react';
import { ErrorScreen } from './feedback/ErrorScreen';
import * as Sentry from '@sentry/react';
import { useLocation } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to Sentry
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', { error, errorInfo });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || (
        <ErrorScreen
          error={error}
          errorInfo={errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return children;
  }
}

// HOC para añadir location al error boundary
export const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return function WithErrorBoundaryWrapper(props: any) {
    const location = useLocation();

    return (
      <ErrorBoundary
        key={location.pathname} // Reset error boundary on route change
        fallback={
          <ErrorScreen
            error={new Error(`Error in ${location.pathname}`)}
            onReset={() => window.location.reload()}
          />
        }
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;
