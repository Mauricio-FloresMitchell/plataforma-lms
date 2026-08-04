import { percentageToReportLevel } from './reportGrade'
import { RUBRIC_LEVEL_FACTOR } from '@/types/rubric'
import type { RubricCriterionDefinition, RubricCriterionScore, RubricScoreResult } from '@/types/rubric'

/**
 * Calcula el resultado de una rúbrica dinámica (Sprint 17, Parte 5):
 * suma el peso de cada criterio ponderado por el nivel obtenido, agrega la
 * bonificación y convierte el % final a letra reutilizando la escala de
 * Reportes (ADR-008) — "al finalizar: se calcula automáticamente %, letra y
 * bonificación", nunca lo captura el profesor a mano.
 */
export function scoreRubric(
  criteria: RubricCriterionDefinition[],
  scores: RubricCriterionScore[],
  bonus = 0,
): RubricScoreResult {
  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0) || 1
  const earned = criteria.reduce((sum, criterion) => {
    const score = scores.find((item) => item.criterionId === criterion.id)
    const factor = score ? RUBRIC_LEVEL_FACTOR[score.level] : 0
    return sum + criterion.weight * factor
  }, 0)
  const percentage = Math.max(0, Math.min(100, Math.round((earned / totalWeight) * 100 + bonus)))
  return { scores, bonus, percentage, letter: percentageToReportLevel(percentage) }
}
