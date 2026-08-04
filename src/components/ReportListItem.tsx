import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ReportStatusBadge } from '@/components/ReportStatusBadge'
import { formatShortDate } from '@/utils/date'
import type { WeeklyReport } from '@/types/report'

interface ReportListItemProps {
  report: WeeklyReport
  /** Destino al abrir el reporte. */
  to: string
  /** Muestra el nombre del alumno (útil en la vista del profesor). */
  showStudent?: boolean
}

/** Fila de reporte reutilizable en los listados de Alumno y Profesor. */
export function ReportListItem({ report, to, showStudent = false }: ReportListItemProps) {
  return (
    <Link to={to} className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
      <Card className="shadow-sm transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
        <CardContent className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-foreground">{report.title}</span>
              <ReportStatusBadge status={report.status} />
            </div>
            <span className="truncate text-xs text-muted-foreground">
              {showStudent ? `${report.studentName} · ` : ''}
              {report.subjectName} · Semana {report.week}
            </span>
            <span className="text-xs text-muted-foreground/80">
              Enviado {formatShortDate(report.submittedAt)}
            </span>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  )
}
