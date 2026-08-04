import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, FileQuestion, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { BackLink } from '@/components/BackLink'
import { Breadcrumb } from '@/components/Breadcrumb'
import { EmptyState } from '@/components/EmptyState'
import { ReportContentCard } from '@/components/ReportContentCard'
import { ReportEvaluationSummary } from '@/components/ReportEvaluationSummary'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { evaluateReport } from '@/services/teacher-report.service'
import { getAvailableBadgesAsync } from '@/services/evaluation.service'
import type { EvaluateReportInput, ReviewDecision } from '@/types/report'
import { EvaluationForm } from '../components/EvaluationForm'
import { useProfessorReport } from '../hooks/useProfessorReport'
import { useReportTemplates } from '../hooks/useReportTemplates'
import type { Badge as BadgeType } from '@/types/evaluation'
import { OpenChatButton } from '@/features/comunicacion/components/OpenChatButton'

/** Revisión y evaluación de un reporte por el profesor. */
export function ProfessorReportReviewPage() {
  const { reportId } = useParams()
  const { user } = useAuth()
  const { report, isLoading, notFound, setReport } = useProfessorReport(reportId)
  const { templates } = useReportTemplates()
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<ReviewDecision | null>(null)

  useEffect(() => {
    getAvailableBadgesAsync().then(setBadges)
  }, [])

  async function handleEvaluate(values: EvaluateReportInput) {
    if (!user || !report) return
    setError(null)
    try {
      const updated = await evaluateReport(user.id, report.id, values)
      if (updated) {
        setReport(updated)
        setDone(values.decision)
      } else {
        setError('No pudimos registrar la evaluación. Inténtalo de nuevo.')
      }
    } catch {
      setError('No pudimos registrar la evaluación. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/profesor' },
          { label: 'Reportes', to: '/profesor/reportes' },
          { label: report?.title ?? 'Detalle' },
        ]}
      />
      <BackLink to="/profesor/reportes" />

      {isLoading ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : notFound || !report ? (
        <EmptyState
          icon={FileQuestion}
          title="Reporte no encontrado"
          description="El reporte que buscas no existe o no está disponible."
        />
      ) : (
        <>
          <OpenChatButton
            recipientId={report.studentId}
            recipientName={report.studentName}
            label="Comentar reporte"
            icon={MessageCircle}
            draftMessage={`Hola ${report.studentName}, tengo un comentario sobre tu reporte "${report.title}".`}
            contextType="reporte"
            contextId={report.id}
            contextLabel={`Reporte — ${report.title}`}
            className="self-start"
          />
          <ReportContentCard report={report} showStudent templates={templates} />

          {done ? (
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertDescription>
                {done === 'aprobado'
                  ? 'Reporte aprobado y evaluación registrada.'
                  : 'Se solicitaron correcciones y se registró la evaluación.'}
              </AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {report.status === 'pendiente' && !done ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Evaluar reporte</CardTitle>
              </CardHeader>
              <CardContent>
                <EvaluationForm badges={badges} onSubmit={handleEvaluate} />
              </CardContent>
            </Card>
          ) : report.evaluation ? (
            <ReportEvaluationSummary evaluation={report.evaluation} badges={badges} />
          ) : null}
        </>
      )}
    </div>
  )
}
