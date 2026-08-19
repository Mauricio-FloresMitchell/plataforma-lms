import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RUBRIC_A_CRITERIA, RUBRIC_B_CRITERIA } from '@/types/evaluation'
import { RUBRIC_LEVEL_FACTOR, RUBRIC_LEVEL_LABELS, RUBRIC_LEVELS } from '@/types/rubric'

/**
 * Catálogo de referencia de Rúbricas (Sprint 19, Parte 4). Las rúbricas son
 * dinámicas por evaluación desde el Sprint 17 (`utils/rubric.ts`, ADR-011) —
 * esta pestaña documenta los criterios base (Rúbrica A/B) y la escala de
 * niveles que usa todo el sistema, no un catálogo editable por separado.
 */
export function RubricsReferenceTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-4">
        <p className="text-sm font-semibold">Rúbrica A — Deliverable de Consultoría (70%)</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {RUBRIC_A_CRITERIA.map((criterion) => (
            <li key={criterion.id} className="flex items-center justify-between text-sm">
              <span>{criterion.name}</span>
              <Badge variant="outline">{criterion.weight} pts</Badge>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-4">
        <p className="text-sm font-semibold">Rúbrica B — Desempeño y actitud (30%)</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {RUBRIC_B_CRITERIA.map((criterion) => (
            <li key={criterion.id} className="flex items-center justify-between text-sm">
              <span>{criterion.name}</span>
              <Badge variant="outline">{criterion.weight} pts</Badge>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-4 lg:col-span-2">
        <p className="text-sm font-semibold">Escala de niveles</p>
        <p className="mt-1 text-xs text-muted-foreground">Aplica a cualquier criterio de cualquier rúbrica del sistema (Evaluaciones, Actividades).</p>
        <ul className="mt-2 flex flex-wrap gap-3">
          {RUBRIC_LEVELS.map((level) => (
            <li key={level} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm">
              <span className="font-medium">{RUBRIC_LEVEL_LABELS[level]}</span>
              <span className="text-xs text-muted-foreground">{Math.round(RUBRIC_LEVEL_FACTOR[level] * 100)}% del peso</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
