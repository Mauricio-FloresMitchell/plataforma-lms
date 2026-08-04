import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CompetencyLevelBadge } from '@/components/CompetencyLevelBadge'
import type { Competency } from '@/types/evaluation'

interface CompetencyEvaluatorProps {
  competencies: Competency[]
  /** Se llama con el nuevo porcentaje (0-100) capturado para la competencia. */
  onPercentageChange?: (competencyId: string, percentage: number) => void
  readOnly?: boolean
}

/**
 * Captura de evaluación por competencia mediante porcentaje (0-100).
 * La letra correspondiente (PRD RN-005) se muestra siempre junto al porcentaje,
 * tanto en modo edición como de solo lectura.
 */
export function CompetencyEvaluator({
  competencies,
  onPercentageChange,
  readOnly = false,
}: CompetencyEvaluatorProps) {
  return (
    <div className="space-y-4">
      {competencies.map((competency) => (
        <Card key={competency.id} className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-sm">{competency.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{competency.description}</p>
              </div>
              <CompetencyLevelBadge level={competency.currentLevel} percentage={competency.percentage} />
            </div>

            {!readOnly && (
              <div className="flex items-center gap-2">
                <label htmlFor={`pct-${competency.id}`} className="text-xs text-muted-foreground min-w-fit">
                  Porcentaje:
                </label>
                <Input
                  id={`pct-${competency.id}`}
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={competency.percentage}
                  onChange={(event) => {
                    const raw = Number(event.target.value)
                    const clamped = Number.isNaN(raw) ? 0 : Math.max(0, Math.min(100, raw))
                    onPercentageChange?.(competency.id, clamped)
                  }}
                  className="h-8 w-24"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
