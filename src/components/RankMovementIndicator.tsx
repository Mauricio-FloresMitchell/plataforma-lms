import { Minus } from 'lucide-react'
import type { RankMovement } from '@/types/gamification'

interface RankMovementIndicatorProps {
  movement: RankMovement
}

/** Flecha ▲▼= de cambio de posición en el Leaderboard (Sprint Leaderboard). */
export function RankMovementIndicator({ movement }: RankMovementIndicatorProps) {
  if (movement === 'up') {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600" title="Subió posiciones">
        ▲
      </span>
    )
  }
  if (movement === 'down') {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600" title="Bajó posiciones">
        ▼
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground" title="Sin cambio">
      <Minus className="size-3" />
    </span>
  )
}
