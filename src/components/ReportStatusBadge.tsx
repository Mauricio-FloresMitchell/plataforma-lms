import { Badge } from '@/components/ui/badge'
import type { ReportStatus } from '@/types/report'

interface ReportStatusBadgeProps {
  status: ReportStatus
}

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  pendiente: { label: 'Pendiente', variant: 'secondary' },
  aprobado: { label: 'Aprobado', variant: 'default' },
  correcciones: { label: 'Correcciones', variant: 'destructive' },
}

/** Insignia de estado de un reporte. Reutilizable por Alumno y Profesor. */
export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status]
  return <Badge variant={variant}>{label}</Badge>
}
