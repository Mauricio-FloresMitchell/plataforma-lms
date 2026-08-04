import { Badge } from '@/components/ui/badge'
import type { CompetencyLevel } from '@/types/evaluation'

interface CompetencyLevelBadgeProps {
  level: CompetencyLevel
  showLabel?: boolean
  /** Si se provee, muestra el porcentaje junto a la letra (ej. "92% · A"). */
  percentage?: number
}

const levelConfig: Record<CompetencyLevel, { bg: string; text: string }> = {
  'A+': { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  A: { bg: 'bg-green-100', text: 'text-green-800' },
  'B+': { bg: 'bg-blue-100', text: 'text-blue-800' },
  B: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  'C+': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  C: { bg: 'bg-amber-100', text: 'text-amber-800' },
  D: { bg: 'bg-orange-100', text: 'text-orange-800' },
  F: { bg: 'bg-red-100', text: 'text-red-800' },
}

export function CompetencyLevelBadge({ level, showLabel = true, percentage }: CompetencyLevelBadgeProps) {
  const config = levelConfig[level]
  const label =
    percentage !== undefined ? `${percentage}% · ${level}` : showLabel ? `Nivel ${level}` : level

  return <Badge className={`${config.bg} ${config.text}`}>{label}</Badge>
}
