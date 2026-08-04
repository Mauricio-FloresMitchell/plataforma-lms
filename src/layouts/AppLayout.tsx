import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLE_NAV } from '@/routes/navigation'
import { APP_NAME } from '@/utils/brand'
import { MainLayout } from './MainLayout'

/**
 * Layout autenticado: obtiene el usuario en sesión y arma la navegación
 * según su rol. Delega la estructura visual a MainLayout (reutilizable).
 */
export function AppLayout() {
  const { user, logout } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <MainLayout
      sections={ROLE_NAV[user.role]}
      brandLabel={APP_NAME}
      title="Inicio"
      user={user}
      onLogout={logout}
    />
  )
}
