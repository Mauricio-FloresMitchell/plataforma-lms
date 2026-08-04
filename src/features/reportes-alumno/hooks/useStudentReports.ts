import { useEffect, useState } from 'react'
import { getStudentReports } from '@/services/student-report.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { WeeklyReport } from '@/types/report'

interface UseStudentReportsResult {
  reports: WeeklyReport[]
  isLoading: boolean
  error: string | null
}

/** Lista de reportes del alumno en sesión. */
export function useStudentReports(): UseStudentReportsResult {
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

    getStudentReports(userId)
      .then((data) => {
        if (active) setReports(data)
      })
      .catch(() => {
        if (active) setError('No pudimos cargar tus reportes. Inténtalo de nuevo.')
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
