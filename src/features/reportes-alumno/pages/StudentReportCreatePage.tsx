import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createStudentReport } from '@/services/student-report.service'
import { ReportTemplateForm } from '../components/ReportTemplateForm'
import { useReportSubjects } from '../hooks/useReportSubjects'
import { useReportTemplates } from '../hooks/useReportTemplates'
import type { CreateReportInput } from '@/types/report'

/** Página de creación de reporte semanal (motor de plantillas académicas, Sprint 12). */
export function StudentReportCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { subjects, isLoading: isLoadingSubjects } = useReportSubjects()
  const { templates, isLoading: isLoadingTemplates } = useReportTemplates()
  const isLoading = isLoadingSubjects || isLoadingTemplates
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(values: CreateReportInput) {
    if (!user) return
    setError(null)
    try {
      await createStudentReport(user.id, user.name, values)
      navigate('/alumno/reportes', { state: { created: true } })
    } catch {
      setError('No pudimos enviar tu reporte. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: 'Inicio', to: '/alumno' },
          { label: 'Reportes', to: '/alumno/reportes' },
          { label: 'Nuevo reporte' },
        ]}
        backTo="/alumno/reportes"
        title="Nuevo reporte"
        subtitle="Registra tu avance de la semana para la materia correspondiente."
      />

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-sm">
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <ReportTemplateForm subjects={subjects} templates={templates} onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
