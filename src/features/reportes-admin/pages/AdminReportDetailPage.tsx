import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, FileQuestion, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BackLink } from '@/components/BackLink'
import { Breadcrumb } from '@/components/Breadcrumb'
import { EmptyState } from '@/components/EmptyState'
import { ReportContentCard } from '@/components/ReportContentCard'
import { ReportEvaluationSummary } from '@/components/ReportEvaluationSummary'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useReportTemplates } from '@/features/reportes-alumno/hooks/useReportTemplates'
import { getAvailableBadgesAsync } from '@/services/evaluation.service'
import { getReportByIdAsync, setReportStatusAsync } from '@/services/admin-report.service'
import { downloadPrintableHtml } from '@/utils/export'
import type { AdminReportView } from '@/types/report'
import type { Badge as BadgeType } from '@/types/evaluation'

/** Detalle de un reporte visto por el Administrador (Sprint 13, Parte 6). */
export function AdminReportDetailPage() {
  const { reportId } = useParams()
  const { user } = useAuth()
  const { templates } = useReportTemplates()
  const [report, setReport] = useState<AdminReportView | null>(null)
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const actor = user ? { id: user.id, name: user.name, role: user.role } : null

  const reload = useCallback(() => {
    if (!reportId) return
    setIsLoading(true)
    getReportByIdAsync(reportId)
      .then(setReport)
      .finally(() => setIsLoading(false))
  }, [reportId])

  useEffect(reload, [reload])
  useEffect(() => {
    getAvailableBadgesAsync().then(setBadges)
  }, [])

  async function handleStatusChange(status: AdminReportView['status'], label: string) {
    if (!actor || !reportId) return
    await setReportStatusAsync(actor, reportId, status, label)
    reload()
  }

  function handleDownloadPdf() {
    if (!report) return
    downloadPrintableHtml(
      `reporte-${report.id}.html`,
      report.title,
      `<p><strong>Alumno:</strong> ${report.studentName}</p>
       <p><strong>Materia:</strong> ${report.subjectName} (${report.groupName})</p>
       <p><strong>Semana:</strong> ${report.week}</p>
       <p><strong>Estado:</strong> ${report.status}</p>
       <p><strong>Contenido:</strong></p><p>${report.content}</p>
       ${report.evaluation ? `<p><strong>Evaluación:</strong> ${report.evaluation.level} — ${report.evaluation.observations}</p>` : ''}`,
    )
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Breadcrumb items={[{ label: 'Inicio', to: '/admin' }, { label: 'Centro de Reportes', to: '/admin/reportes' }, { label: report?.title ?? 'Detalle' }]} />
      <BackLink to="/admin/reportes" />

      {isLoading ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : !report ? (
        <EmptyState icon={FileQuestion} title="Reporte no encontrado" description="El reporte que buscas no existe o no está disponible." />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              <Download className="size-3.5" />
              Descargar PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => void handleStatusChange('aprobado', 'Aprobó')}>
              <ThumbsUp className="size-3.5" />
              Aprobar
            </Button>
            <Button variant="outline" size="sm" onClick={() => void handleStatusChange('correcciones', 'Rechazó')}>
              <ThumbsDown className="size-3.5" />
              Rechazar
            </Button>
            <Button variant="outline" size="sm" onClick={() => void handleStatusChange('pendiente', 'Devolvió')}>
              <RotateCcw className="size-3.5" />
              Devolver
            </Button>
          </div>

          <ReportContentCard report={report} showStudent templates={templates} />
          {report.evaluation ? <ReportEvaluationSummary evaluation={report.evaluation} badges={badges} /> : null}
        </>
      )}
    </div>
  )
}
