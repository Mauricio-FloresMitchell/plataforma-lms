import { Paperclip, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ReportStatusBadge } from '@/components/ReportStatusBadge'
import { ReportTemplateAnswers } from '@/components/ReportTemplateAnswers'
import { REPORT_FILE_KIND_LABELS, REPORT_LINK_PLATFORM_LABELS } from '@/utils/reportAttachments'
import { formatDateTime } from '@/utils/date'
import type { WeeklyReport } from '@/types/report'
import type { ReportTemplate } from '@/types/reportTemplate'

interface ReportContentCardProps {
  report: WeeklyReport
  /** Muestra el nombre del alumno (vista del profesor). */
  showStudent?: boolean
  /** Plantillas académicas disponibles (Sprint 12), para resolver `report.templateId`. */
  templates?: ReportTemplate[]
}

/**
 * Tarjeta con el contenido de un reporte. Reutilizable por Alumno y Profesor
 * — el Profesor ve exactamente esta misma tarjeta al revisar un reporte
 * (PRD §12.4). Desde el Sprint 12, si el reporte fue creado con el motor de
 * plantillas (`report.templateId`), renderiza sus campos y preguntas
 * dinámicas en lugar del párrafo libre legado.
 */
export function ReportContentCard({ report, showStudent = false, templates = [] }: ReportContentCardProps) {
  const template = report.templateId ? templates.find((item) => item.id === report.templateId) : undefined
  return (
    <Card className="shadow-sm">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">{report.title}</h3>
          <ReportStatusBadge status={report.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {showStudent ? `${report.studentName} · ` : ''}
          {report.subjectName} · Grupo {report.groupName} · Semana {report.week}
        </p>
        <p className="text-xs text-muted-foreground/80">
          Enviado el {formatDateTime(report.submittedAt)}
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {template ? (
          <ReportTemplateAnswers report={report} template={template} />
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{report.content}</p>
        )}

        {report.evidences.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Evidencias</span>
            <ul className="flex flex-col gap-1">
              {report.evidences.map((evidence) => (
                <li key={evidence.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Paperclip className="size-4" />
                  {evidence.name}
                  {evidence.fileKind ? ` (${REPORT_FILE_KIND_LABELS[evidence.fileKind]})` : ''}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {report.links && report.links.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Enlaces</span>
            <ul className="flex flex-col gap-1">
              {report.links.map((link) => (
                <li key={link.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link2 className="size-4" />
                  <span className="font-medium">{REPORT_LINK_PLATFORM_LABELS[link.platform]}:</span>
                  <a href={link.url} target="_blank" rel="noreferrer" className="truncate underline hover:text-foreground">
                    {link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
