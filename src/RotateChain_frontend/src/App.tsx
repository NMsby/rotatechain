import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from './components/ui/sonner'
import ProtectedRoute from './components/common/ProtectedRoute'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import DashboardLayout from './components/layout/DashboardLayout'
import MistralWidget from './components/common/AiAssistant'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import AiAssistant from './components/common/AiAssistant'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                />
                {/* Logout Route */}
                <Route path="/logout" element={<LogoutPage />} />
              </Routes>

              {/* Global Components */}
              <Toaster position="top-right" />
              <AiAssistant /> {/* Add AiAssistant  here */}
            </div>
          </Router>

          {/* Dev tools - only in development */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
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
  // This would typically be handled by the auth context
  React.useEffect(() => {
    localStorage.removeItem('rotatechain_user')
    localStorage.removeItem('rotatechain_authenticated')
    window.location.href = '/'
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Logging out...</h2>
        <p className="text-muted-foreground">Please wait while we sign you out.</p>
      </div>
    </div>
  )
}

export default App
