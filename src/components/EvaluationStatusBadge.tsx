import { Badge } from '@/components/ui/badge'
import type { FeedbackStatus } from '@/types/evaluation'

interface EvaluationStatusBadgeProps {
  status: FeedbackStatus
}

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-secondary text-secondary-foreground' },
  borrador: { label: 'Borrador', className: 'bg-amber-100 text-amber-800' },
  publicada: { label: 'Publicada', className: 'bg-green-100 text-green-800' },
}

/** Insignia del estado de retroalimentación de una evaluación (PRD §12.5). */
export function EvaluationStatusBadge({ status }: EvaluationStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return <Badge className={config.className}>{config.label}</Badge>
}
