import { useEffect, useState } from 'react'
import { getReportSubjects, type SubjectOption } from '@/services/student-report.service'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface UseReportSubjectsResult {
  subjects: SubjectOption[]
  isLoading: boolean
}

/** Materias disponibles para que el alumno cree un reporte. */
export function useReportSubjects(): UseReportSubjectsResult {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const userId = user?.id

  useEffect(() => {
    if (!userId) return

    let active = true
    setIsLoading(true)

    getReportSubjects(userId)
      .then((data) => {
        if (active) setSubjects(data)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [userId])

  return { subjects, isLoading }
}
