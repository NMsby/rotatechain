import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from './components/ui/sonner'
import ProtectedRoute from './components/common/ProtectedRoute'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import DashboardLayout from './components/layout/DashboardLayout'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry auth errors
        if (error?.message?.includes('Authentication') || error?.message?.includes('Principal')) {
          return false
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                {/* Public Routes */}
                <Route path="/*" element={<PublicLayout />} />

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard/*" element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                } />

                {/* Logout Route */}
                <Route path="/logout" element={<LogoutPage />} />
              </Routes>
              
              {/* Global Components */}
              <Toaster 
                position="top-right" 
                expand={false}
                richColors={true}
                closeButton={true}
                duration={4000}
              />
            </div>
          </Router>
          
          {/* Dev tools - only in development */}
          {import.meta.env.MODE === 'development' && (
            <ReactQueryDevtools 
              initialIsOpen={false} 
              position="bottom-right"
              buttonPosition="bottom-right"
            />
          )}

          {/* Development Auth Status Indicator */}
          {import.meta.env.MODE === 'development' && <DevAuthIndicator />}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Public layout with header and footer
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

// Logout page that clears auth and redirects
function LogoutPage() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(true);

  React.useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('🔄 Performing logout...');

        // Use the auth context logout method for proper cleanup
        await logout();

        console.log('✅ Logout completed');

        // Small delay for UX
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } catch (error) {
        console.error('❌ Logout error:', error);
        
        // Fallback: manual cleanup
        localStorage.removeItem('rotatechain_user');
        localStorage.removeItem('rotatechain_authenticated');
        localStorage.removeItem('rotatechain_auth_method');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } finally {
        setIsLoggingOut(false);
      }
    };

    performLogout();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          {isLoggingOut ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          ) : (
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-2">
          {isLoggingOut ? 'Signing out...' : 'Signed out successfully'}
        </h2>

        <p className="text-muted-foreground">
          {isLoggingOut 
            ? 'Please wait while we securely sign you out.'
            : 'You have been signed out. Redirecting to home page...'
          }
        </p>

        {/* Auth method indicator */}
        {import.meta.env.MODE === 'development' && (
          <div className="mt-4 text-xs text-muted-foreground">
            Auth method: {localStorage.getItem('rotatechain_auth_method') || 'None'}
          </div>
        )}
      </div>
    </div>
  )
}

// Development-only auth status indicator
function DevAuthIndicator() {
  const { isAuthenticated, user, principal, error } = useAuth();
  const [isVisible, setIsVisible] = React.useState(false);

  // Only show in development mode
  if (import.meta.env.MODE !== 'development') return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        title="Toggle Auth Status"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Auth status panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-background border rounded-lg p-4 shadow-lg max-w-sm">
          <h3 className="font-bold text-sm mb-2">🔧 Auth Debug Panel</h3>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Method:</span>
              <span>{localStorage.getItem('rotatechain_auth_method') || 'None'}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Environment:</span>
              <span>{import.meta.env.VITE_USE_INTERNET_IDENTITY === 'true' ? 'Internet Identity' : 'Mock Auth'}</span>
            </div>

            {user && (
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span>User:</span>
                  <span className="truncate ml-2">{user.name}</span>
                </div>
              </div>
            )}

            {principal && (
              <div className="flex justify-between">
                <span>Principal:</span>
                <span className="font-mono text-xs truncate ml-2">{principal.slice(0, 10)}...</span>
              </div>
            )}

            {error && (
              <div className="pt-2 border-t">
                <div className="text-red-600">
                  <span>Error:</span>
                  <div className="text-xs mt-1">{error}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default App