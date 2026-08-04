import { useEffect, useState } from 'react'
import { getStudentDashboard } from '@/services/student.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { StudentDashboard } from '@/types/student'

interface UseStudentDashboardResult {
  data: StudentDashboard | null
  isLoading: boolean
  error: string | null
}

/**
 * Obtiene el Dashboard del alumno en sesión a través de la capa de servicios.
 * Los componentes visuales nunca acceden a los datos directamente.
 */
export function useStudentDashboard(): UseStudentDashboardResult {
  const { user } = useAuth()
  const [data, setData] = useState<StudentDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id
  const userName = user?.name ?? ''

  useEffect(() => {
    if (!userId) return

    let active = true
    setIsLoading(true)
    setError(null)

    getStudentDashboard(userId, userName)
      .then((dashboard) => {
        if (active) setData(dashboard)
      })
      .catch(() => {
        if (active) setError('No pudimos cargar tu información. Inténtalo de nuevo.')
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
