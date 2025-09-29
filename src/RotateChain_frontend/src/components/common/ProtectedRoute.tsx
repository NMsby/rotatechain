import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requiredRole?: "admin" | "user" // optional role-based access
}

export function ProtectedRoute({
  children,
  redirectTo = "/login",
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    )
  }

  // ✅ Role-based restriction
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location }}
        replace
      />
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
