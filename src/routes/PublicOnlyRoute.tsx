import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getRoleHome } from './navigation'

/**
 * Rutas accesibles solo sin sesión (ej. /login).
 * Si ya hay sesión activa, redirige al inicio del rol.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }

  return <Outlet />
}
