import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';

/**
 * Main entry point for the React application
 * This file is responsible for:
 * - Rendering the root component
 * - Setting up error boundaries (in production)
 * - Performance monitoring
 * - Service worker registration (for PWA)
 */

// Performance monitoring
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Error Boundary Component (for production)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorMonitoringService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-error-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                We're sorry, but something went wrong. Please try refreshing the page.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary w-full"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="btn btn-secondary w-full"
                >
                  Go to Homepage
                </button>
              </div>
              
              {/* Development error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto">
                    <div className="text-error-600 font-semibold mb-2">
                      {this.state.error.toString()}
                    </div>
                    <div className="text-gray-600">
                      {this.state.errorInfo.componentStack}
                    </div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Service Worker Registration (for PWA)
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('SW update found: ', newWorker);
      });
      
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};

// Initialize the application
const initializeApp = () => {
  try {
    // Get the root element
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Root element not found. Make sure there is an element with id "root" in your HTML.');
    }

    // Create React root
    const root = ReactDOM.createRoot(rootElement);

    // Render the app
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );

    // Register service worker for PWA
    registerServiceWorker();

    // Report web vitals in development
    if (process.env.NODE_ENV === 'development') {
      reportWebVitals(console.log);
    }

    console.log('🚀 TaskFlow Pro application initialized successfully');

  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Fallback error display
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f3f4f6; padding: 1rem;">
          <div style="max-width: 400px; width: 100%; text-align: center;">
            <div style="background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 2rem;">
              <div style="color: #ef4444; margin-bottom: 1rem;">
                <svg style="width: 4rem; height: 4rem; margin: 0 auto;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h1 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">Application Error</h1>
              <p style="color: #6b7280; margin-bottom: 1.5rem;">Failed to load the application. Please refresh the page.</p>
              <button 
                onclick="window.location.reload()" 
                style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.375rem; font-weight: 500; cursor: pointer; width: 100%;"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }
};

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for testing purposes
export { reportWebVitals };