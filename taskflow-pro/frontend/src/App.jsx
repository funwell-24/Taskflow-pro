import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import { APP_CONFIG, STORAGE_KEYS, THEMES } from './utils/constants';
import './App.css';

function App() {
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      let theme = savedTheme || THEMES.AUTO;
      
      if (theme === THEMES.AUTO) {
        theme = systemPrefersDark ? THEMES.DARK : THEMES.LIGHT;
      }
      
      applyTheme(theme);
    };

    const applyTheme = (theme) => {
      const root = document.documentElement;
      
      if (theme === THEMES.DARK) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    };

    initializeTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme === THEMES.AUTO) {
        applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Error boundary fallback (would be implemented with ErrorBoundary component in production)
  const GlobalErrorHandler = () => {
    useEffect(() => {
      const handleError = (event) => {
        console.error('Global error caught:', event.error);
        // In production, you might want to send this to an error reporting service
      };

      const handleUnhandledRejection = (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        event.preventDefault();
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }, []);

    return null;
  };

  return (
    <HelmetProvider>
      <div className="App">
        <GlobalErrorHandler />
        
        {/* SEO and Meta Tags */}
        <Helmet>
          <title>{APP_CONFIG.NAME} - {APP_CONFIG.DESCRIPTION}</title>
          <meta name="description" content={APP_CONFIG.DESCRIPTION} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          
          {/* Open Graph */}
          <meta property="og:title" content={APP_CONFIG.NAME} />
          <meta property="og:description" content={APP_CONFIG.DESCRIPTION} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={window.location.origin} />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={APP_CONFIG.NAME} />
          <meta name="twitter:description" content={APP_CONFIG.DESCRIPTION} />
          
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          
          {/* Preload critical resources */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        </Helmet>

        <AuthProvider>
          <Router>
            <div className="app">
              {/* Toast Notifications */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--gray-50)',
                    color: 'var(--gray-900)',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)',
                    fontSize: 'var(--text-sm)',
                    maxWidth: '400px',
                  },
                  success: {
                    style: {
                      borderLeft: '4px solid var(--success-500)',
                    },
                    iconTheme: {
                      primary: 'var(--success-500)',
                      secondary: 'var(--gray-50)',
                    },
                  },
                  error: {
                    style: {
                      borderLeft: '4px solid var(--error-500)',
                    },
                    iconTheme: {
                      primary: 'var(--error-500)',
                      secondary: 'var(--gray-50)',
                    },
                  },
                  loading: {
                    style: {
                      borderLeft: '4px solid var(--primary-500)',
                    },
                  },
                }}
              />
              
              <Routes>
                {/* Public Routes - Redirect to dashboard if already authenticated */}
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Login />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Register />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected Routes - Require authentication */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tasks" 
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <Tasks />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <Profile />
                    </ProtectedRoute>
                  } 
                />

                {/* Additional routes can be added here */}
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <div className="main-content">
                        <div className="text-center py-12">
                          <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                          <p className="text-gray-600">Settings page coming soon...</p>
                        </div>
                      </div>
                    </ProtectedRoute>
                  } 
                />

                {/* Team route placeholder */}
                <Route 
                  path="/team" 
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <div className="main-content">
                        <div className="text-center py-12">
                          <h1 className="text-2xl font-bold text-gray-900 mb-4">Team</h1>
                          <p className="text-gray-600">Team collaboration features coming soon...</p>
                        </div>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 Page */}
                <Route 
                  path="/404" 
                  element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                        <p className="text-xl text-gray-600 mb-8">Page not found</p>
                        <a 
                          href="/" 
                          className="btn btn-primary"
                        >
                          Go Home
                        </a>
                      </div>
                    </div>
                  } 
                />
                
                {/* Fallback route - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </div>
    </HelmetProvider>
  );
}

// Performance monitoring (optional)
if (process.env.NODE_ENV === 'production') {
  // You can integrate with analytics or monitoring services here
  console.log(`${APP_CONFIG.NAME} v${APP_CONFIG.VERSION} loaded successfully`);
}

export default App;