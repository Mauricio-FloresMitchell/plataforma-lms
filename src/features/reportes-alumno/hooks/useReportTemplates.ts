import { useEffect, useState } from 'react'
import { getReportTemplatesAsync } from '@/services/student-report.service'
import type { ReportTemplate } from '@/types/reportTemplate'

interface UseReportTemplatesResult {
  templates: ReportTemplate[]
  isLoading: boolean
}

/** Las 7 plantillas académicas del motor de Reportes (Sprint 12). */
export function useReportTemplates(): UseReportTemplatesResult {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    setIsLoading(true)

    getReportTemplatesAsync()
      .then((data) => {
        if (active) setTemplates(data)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { templates, isLoading }
}
