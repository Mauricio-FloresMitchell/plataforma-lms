import { useEffect, useState } from 'react'
import { getStudentReport } from '@/services/student-report.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { WeeklyReport } from '@/types/report'

interface UseStudentReportResult {
  report: WeeklyReport | null
  isLoading: boolean
  notFound: boolean
}

/** Detalle de un reporte del alumno en sesión. */
export function useStudentReport(reportId: string | undefined): UseStudentReportResult {
  const { user } = useAuth()
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const userId = user?.id

  useEffect(() => {
    if (!userId || !reportId) return

    let active = true
    setIsLoading(true)
    setNotFound(false)

    getStudentReport(userId, reportId)
      .then((data) => {
        if (!active) return
        if (data) setReport(data)
        else setNotFound(true)
      })
      .catch(() => {
        if (active) setNotFound(true)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [userId, reportId])

  return { report, isLoading, notFound }
}
