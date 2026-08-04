import { Card } from '@/components/ui/card'
import type { PointActionId, PointCatalogEntry } from '@/types/gamification'

interface PointCatalogPickerProps {
  catalog: PointCatalogEntry[]
  selectedActionId: PointActionId | ''
  onSelect: (actionId: PointActionId) => void
}

/**
 * Selector del catálogo cerrado de acciones de puntos. El profesor únicamente
 * elige una tarjeta — nunca hay un campo numérico libre (regla del sprint).
 */
export function PointCatalogPicker({ catalog, selectedActionId, onSelect }: PointCatalogPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {catalog.map((entry) => {
        const isSelected = entry.id === selectedActionId
        const isPositive = entry.points > 0

        return (
          <Card
            key={entry.id}
            className={`cursor-pointer p-4 transition-all ${
              isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
            }`}
            onClick={() => onSelect(entry.id)}
          >
            <p className="text-sm font-medium">{entry.label}</p>
            <p className={`mt-1 text-lg font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}
              {entry.points}
            </p>
          </Card>
        )
      })}
    </div>
  )
}
