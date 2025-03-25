import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './index.css';

// Development error handling
if (import.meta.env.DEV) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Log original error
    originalConsoleError(...args);

    // Log additional context for React errors
    if (args[0] && args[0].includes && args[0].includes('React')) {
      console.log('React Error Context:', {
        reduxState: store.getState(),
        location: window.location.href,
      });
    }
  };

  window.onerror = (message, source, lineno, colno, error) => {
    console.log('Global Error:', {
      message,
      source,
      lineno,
      colno,
      error,
      reduxState: store.getState(),
      location: window.location.href,
    });
  };
}

// Create root
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

const renderApp = () => {
  root.render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <App />
          </Suspense>
        </BrowserRouter>
      </Provider>
    </StrictMode>
  );
};

renderApp();

// Enable HMR in development
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    console.log('HMR: Reloading App component');
    renderApp();
  });
}

// Log environment info in development
if (import.meta.env.DEV) {
  console.log('Environment:', {
    mode: import.meta.env.MODE,
    base: import.meta.env.BASE_URL,
    dev: import.meta.env.DEV,
  });
}
