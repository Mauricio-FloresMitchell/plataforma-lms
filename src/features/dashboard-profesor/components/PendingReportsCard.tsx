import { Link } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { formatRelativeToNow } from '@/utils/date'
import type { PendingReport } from '@/types/professor'

interface PendingReportsCardProps {
  reports: PendingReport[]
}

/** Reportes enviados por alumnos pendientes de revisión. */
export function PendingReportsCard({ reports }: PendingReportsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Reportes pendientes</CardTitle>
      </CardHeader>

      <CardContent>
        {reports.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Sin reportes pendientes"
            description="No tienes reportes por revisar por ahora."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {reports.map((report) => (
              <li
                key={report.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground">
                    {report.studentName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {report.subjectName} · Semana {report.week}
                  </span>
                  <span className="text-xs text-muted-foreground/80">
                    Enviado {formatRelativeToNow(report.submittedAt)}
                  </span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/profesor/reportes/${report.id}`}>Revisar</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
