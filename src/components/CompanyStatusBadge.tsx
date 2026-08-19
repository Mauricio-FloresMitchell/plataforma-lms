import { Badge } from '@/components/ui/badge'
import type { CompanyProspectStatus } from '@/types/company'

interface CompanyStatusBadgeProps {
  status: CompanyProspectStatus
}

const STATUS_CONFIG: Record<CompanyProspectStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  confirmada: { label: 'Confirmada', variant: 'default' },
  candidata: { label: 'Candidata', variant: 'secondary' },
  rechazada: { label: 'Descartada', variant: 'outline' },
}

/** Estado de una empresa del banco de Prospección Estudiantil (Mejora 2). */
export function CompanyStatusBadge({ status }: CompanyStatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status]
  return <Badge variant={variant}>{label}</Badge>
}
