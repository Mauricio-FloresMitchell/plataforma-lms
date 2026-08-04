import { Card } from '@/components/ui/card'
import type { Badge } from '@/types/evaluation'

interface BadgeListProps {
  badges: Badge[]
  selectable?: boolean
  selectedBadgeIds?: string[]
  onBadgeToggle?: (badgeId: string) => void
}

export function BadgeList({
  badges,
  selectable = false,
  selectedBadgeIds = [],
  onBadgeToggle,
}: BadgeListProps) {
  if (badges.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No hay insignias</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {badges.map((badge) => {
        const isSelected = selectedBadgeIds.includes(badge.id)

        return (
          <Card
            key={badge.id}
            className={`p-4 cursor-pointer transition-all ${
              selectable
                ? isSelected
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:shadow-md'
                : ''
            }`}
            onClick={() => selectable && onBadgeToggle?.(badge.id)}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{badge.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{badge.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                {badge.earnedAt && (
                  <p className="text-xs text-green-600 mt-2">
                    Obtenida: {new Date(badge.earnedAt).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
