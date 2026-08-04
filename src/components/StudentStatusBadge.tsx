import { Badge } from '@/components/ui/badge'
import type { StudentGamificationStatus } from '@/types/gamification'

interface StudentStatusBadgeProps {
  status: StudentGamificationStatus
}

const STATUS_CONFIG: Record<StudentGamificationStatus, { label: string; className: string }> = {
  destacado: { label: 'Destacado', className: 'bg-emerald-100 text-emerald-800' },
  activo: { label: 'Activo', className: 'bg-blue-100 text-blue-800' },
  en_riesgo: { label: 'En riesgo', className: 'bg-red-100 text-red-800' },
}

/** Estado del alumno derivado de su puntaje de Gamificación (Sprint Leaderboard). */
export function StudentStatusBadge({ status }: StudentStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return <Badge className={config.className}>{config.label}</Badge>
}
