import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

interface ProtectedRouteProps {
  children?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login but keep the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
