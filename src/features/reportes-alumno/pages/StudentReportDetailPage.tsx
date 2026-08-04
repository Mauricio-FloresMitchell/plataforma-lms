import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileQuestion, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BackLink } from '@/components/BackLink'
import { Breadcrumb } from '@/components/Breadcrumb'
import { EmptyState } from '@/components/EmptyState'
import { ReportContentCard } from '@/components/ReportContentCard'
import { ReportEvaluationSummary } from '@/components/ReportEvaluationSummary'
import { getAvailableBadgesAsync } from '@/services/evaluation.service'
import type { Badge as BadgeType } from '@/types/evaluation'
import { OpenChatButton } from '@/features/comunicacion/components/OpenChatButton'
import { useStudentReport } from '../hooks/useStudentReport'
import { useReportTemplates } from '../hooks/useReportTemplates'

/** Detalle de un reporte del alumno. */
export function StudentReportDetailPage() {
  const { reportId } = useParams()
  const { report, isLoading, notFound } = useStudentReport(reportId)
  const { templates } = useReportTemplates()
  const [badges, setBadges] = useState<BadgeType[]>([])

  useEffect(() => {
    getAvailableBadgesAsync().then(setBadges)
  }, [])

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/alumno' },
          { label: 'Reportes', to: '/alumno/reportes' },
          { label: report?.title ?? 'Detalle' },
        ]}
      />
      <BackLink to="/alumno/reportes" />

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
            recipientId="usr-profesor-001"
            recipientName="tu profesor"
            label="Comentar reporte"
            icon={MessageCircle}
            draftMessage={`Hola, tengo un comentario sobre mi reporte "${report.title}".`}
            contextType="reporte"
            contextId={report.id}
            contextLabel={`Reporte — ${report.title}`}
            className="self-start"
          />
          <ReportContentCard report={report} templates={templates} />
          {report.evaluation ? <ReportEvaluationSummary evaluation={report.evaluation} badges={badges} /> : null}
        </>
      )}
    </div>
  )
}
