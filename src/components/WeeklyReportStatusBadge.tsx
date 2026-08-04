import { Badge } from '@/components/ui/badge'
import type { WeeklyReportStatus } from '@/types/evaluation'

interface WeeklyReportStatusBadgeProps {
  status: WeeklyReportStatus
}

const STATUS_CONFIG: Record<WeeklyReportStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  aprobado: { label: 'Reporte aprobado', variant: 'default' },
  pendiente: { label: 'Reporte pendiente', variant: 'secondary' },
  correcciones: { label: 'Reporte con correcciones', variant: 'destructive' },
  sin_reporte: { label: 'Sin reporte', variant: 'outline' },
}

/** Insignia del estado del reporte semanal de un alumno, usada en el listado de evaluación por materia. */
export function WeeklyReportStatusBadge({ status }: WeeklyReportStatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status]
  return <Badge variant={variant}>{label}</Badge>
}
