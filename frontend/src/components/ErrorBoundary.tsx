import React from 'react';
import ErrorScreen from './feedback/ErrorScreen';
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

    // Development error handling
    if (import.meta.env.DEV) {
      console.group('Error Boundary Caught Error:');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.log('Error Location:', window.location.href);
      console.log('Redux State:', (window as any).__REDUX_STORE__?.getState());
      console.groupEnd();
      return;
    }

    // Production error handling
    Sentry.withScope((scope) => {
      scope.setExtras({
        ...errorInfo,
        location: window.location.href,
      });
      Sentry.captureException(error);
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Development error display
      if (import.meta.env.DEV) {
        return fallback || (
          <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: 'red' }}>Development Error</h1>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px'
            }}>
              {error?.stack}
            </pre>
            <div style={{ marginTop: '20px' }}>
              <h2>Component Stack:</h2>
              <pre style={{ 
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '4px'
              }}>
                {errorInfo?.componentStack}
              </pre>
            </div>
            <button 
              onClick={this.handleReset}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        );
      }

      // Production error display
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

// Add Redux store to window in development
if (import.meta.env.DEV) {
  import('../store').then(({ store }) => {
    (window as any).__REDUX_STORE__ = store;
  });
}

export default ErrorBoundary;
