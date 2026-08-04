import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '@/types/auth'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getRoleHome } from './navigation'

interface ProtectedRouteProps {
  /** Roles autorizados para esta rama de rutas. */
  allow: Role[]
}

/**
 * Guarda de rutas por rol.
 * - No autenticado  → redirige a /login.
 * - Rol no permitido → redirige al inicio de su propio rol.
 */
export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!allow.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }

  return <Outlet />
}
