import { useCallback, useEffect, useState } from 'react'
import { getReportForReview } from '@/services/teacher-report.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { WeeklyReport } from '@/types/report'

interface UseProfessorReportResult {
  report: WeeklyReport | null
  isLoading: boolean
  notFound: boolean
  /** Actualiza el reporte en memoria tras una evaluación. */
  setReport: (report: WeeklyReport) => void
}

/** Detalle de un reporte para revisión del profesor. */
export function useProfessorReport(reportId: string | undefined): UseProfessorReportResult {
  const { user } = useAuth()
  const [report, setReportState] = useState<WeeklyReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const userId = user?.id

  useEffect(() => {
    if (!userId || !reportId) return

    let active = true
    setIsLoading(true)
    setNotFound(false)

    getReportForReview(userId, reportId)
      .then((data) => {
        if (!active) return
        if (data) setReportState(data)
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

  const setReport = useCallback((next: WeeklyReport) => setReportState(next), [])

  return { report, isLoading, notFound, setReport }
}
