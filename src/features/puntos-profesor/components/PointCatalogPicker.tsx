import { Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { PointActionId, PointCatalogEntry } from '@/types/gamification'

interface PointCatalogPickerProps {
  catalog: PointCatalogEntry[]
  selectedActionIds: PointActionId[]
  onToggle: (actionId: PointActionId) => void
}

/**
 * Selector del catálogo cerrado de acciones de puntos. El profesor solo
 * elige entre las tarjetas del catálogo — nunca hay un campo numérico libre
 * (regla del sprint) — y puede marcar varias a la vez; se suman al guardar.
 */
export function PointCatalogPicker({ catalog, selectedActionIds, onToggle }: PointCatalogPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {catalog.map((entry) => {
        const isSelected = selectedActionIds.includes(entry.id)
        const isPositive = entry.points > 0

        return (
          <Card
            key={entry.id}
            className={`relative cursor-pointer p-4 transition-all ${
              isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
            }`}
            onClick={() => onToggle(entry.id)}
          >
            {isSelected ? (
              <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
            ) : null}
            <p className="pr-4 text-sm font-medium">{entry.label}</p>
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
