import { useEffect, useState } from 'react'
import { getPendingReports } from '@/services/teacher-report.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { WeeklyReport } from '@/types/report'

interface UseProfessorReportsResult {
  reports: WeeklyReport[]
  isLoading: boolean
  error: string | null
}

/** Reportes pendientes de revisión del profesor en sesión. */
export function useProfessorReports(): UseProfessorReportsResult {
  const { user } = useAuth()
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id

  useEffect(() => {
    if (!userId) return

    let active = true
    setIsLoading(true)
    setError(null)

    getPendingReports(userId)
      .then((data) => {
        if (active) setReports(data)
      })
      .catch(() => {
        if (active) setError('No pudimos cargar los reportes. Inténtalo de nuevo.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [userId])

  return { reports, isLoading, error }
}
