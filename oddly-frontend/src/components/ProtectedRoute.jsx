import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../services/auth'

export default function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    // Replace history so back button can't go back to protected page
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}