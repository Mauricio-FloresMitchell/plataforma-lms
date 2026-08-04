import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { RUBRIC_LEVELS, RUBRIC_LEVEL_LABELS } from '@/types/rubric'
import type { RubricCriterionDefinition, RubricCriterionScore } from '@/types/rubric'
import { scoreRubric } from '@/utils/rubric'

interface RubricEditorProps {
  title: string
  criteria: RubricCriterionDefinition[]
  scores: RubricCriterionScore[]
  onChange: (scores: RubricCriterionScore[]) => void
  readOnly?: boolean
}

/**
 * Captura de una rúbrica dinámica (Sprint 17, Parte 5): cada criterio tiene
 * nombre, peso y un nivel seleccionable con comentario. El % y la letra se
 * calculan siempre en vivo (`scoreRubric`), nunca los captura el profesor.
 */
export function RubricEditor({ title, criteria, scores, onChange, readOnly = false }: RubricEditorProps) {
  const result = scoreRubric(criteria, scores)

  function setLevel(criterionId: string, level: RubricCriterionScore['level']) {
    const existing = scores.find((item) => item.criterionId === criterionId)
    const next = existing
      ? scores.map((item) => (item.criterionId === criterionId ? { ...item, level } : item))
      : [...scores, { criterionId, level }]
    onChange(next)
  }

  function setComments(criterionId: string, comments: string) {
    const existing = scores.find((item) => item.criterionId === criterionId)
    const next: RubricCriterionScore[] = existing
      ? scores.map((item) => (item.criterionId === criterionId ? { ...item, comments } : item))
      : [...scores, { criterionId, level: 'suficiente' as const, comments }]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">{result.percentage}%</span>
          <Badge variant="outline">{result.letter}</Badge>
        </div>
      </div>

      {criteria.map((criterion) => {
        const score = scores.find((item) => item.criterionId === criterion.id)
        return (
          <Card key={criterion.id} className="p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{criterion.name}</p>
              <span className="text-xs text-muted-foreground">{criterion.weight} pts</span>
            </div>

            {readOnly ? (
              <p className="text-xs text-muted-foreground">
                {score ? RUBRIC_LEVEL_LABELS[score.level] : 'Sin calificar'}
                {score?.comments ? ` — ${score.comments}` : ''}
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {RUBRIC_LEVELS.map((level) => (
                    <Button
                      key={level}
                      type="button"
                      size="sm"
                      variant={score?.level === level ? 'default' : 'outline'}
                      className="h-7 px-2.5 text-xs"
                      onClick={() => setLevel(criterion.id, level)}
                    >
                      {RUBRIC_LEVEL_LABELS[level]}
                    </Button>
                  ))}
                </div>
                <Textarea
                  placeholder="Comentarios sobre este criterio (opcional)"
                  value={score?.comments ?? ''}
                  onChange={(event) => setComments(criterion.id, event.target.value)}
                  className="min-h-16 text-sm"
                />
              </>
            )}
          </Card>
        )
      })}
    </div>
  )
}
