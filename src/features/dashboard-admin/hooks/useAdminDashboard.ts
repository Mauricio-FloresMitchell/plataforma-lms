import { useEffect, useState } from 'react'
import { getAdminDashboard } from '@/services/admin.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { AdminDashboard } from '@/types/admin'

interface UseAdminDashboardResult {
  data: AdminDashboard | null
  isLoading: boolean
  error: string | null
}

/**
 * Obtiene el Dashboard del administrador en sesión a través de la capa de servicios.
 * Los componentes visuales nunca acceden a los datos directamente.
 */
export function useAdminDashboard(): UseAdminDashboardResult {
  const { user } = useAuth()
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id
  const userName = user?.name ?? ''

  useEffect(() => {
    if (!userId) return

    let active = true
    setIsLoading(true)
    setError(null)

    getAdminDashboard(userId, userName)
      .then((dashboard) => {
        if (active) setData(dashboard)
      })
      .catch(() => {
        if (active) setError('No pudimos cargar la información. Inténtalo de nuevo.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [userId, userName])

  return { data, isLoading, error }
}
