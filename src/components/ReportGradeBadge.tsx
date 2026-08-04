import { Badge } from '@/components/ui/badge'
import type { ReportGradeLevel } from '@/types/report'

interface ReportGradeBadgeProps {
  level: ReportGradeLevel
  /** Si se provee, muestra el porcentaje junto a la letra (ej. "87% · B"). */
  percentage?: number
}

const levelConfig: Record<ReportGradeLevel, { bg: string; text: string }> = {
  A: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  B: { bg: 'bg-blue-100', text: 'text-blue-800' },
  C: { bg: 'bg-amber-100', text: 'text-amber-800' },
  D: { bg: 'bg-orange-100', text: 'text-orange-800' },
  F: { bg: 'bg-red-100', text: 'text-red-800' },
}

/** Insignia de la escala de 5 niveles de la Evaluación Docente de Reportes (Sprint 12, ADR-008). */
export function ReportGradeBadge({ level, percentage }: ReportGradeBadgeProps) {
  const config = levelConfig[level]
  const label = percentage !== undefined ? `${percentage}% · ${level}` : level
  return <Badge className={`${config.bg} ${config.text}`}>{label}</Badge>
}
