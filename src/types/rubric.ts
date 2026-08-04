import type { ReportGradeLevel } from './report'

/**
 * Motor de Rúbricas dinámicas (Sprint 17, Parte 5).
 *
 * Reutilizable por cualquier módulo que necesite calificar contra criterios
 * con peso (Evaluaciones — Rúbrica A/Rúbrica B — y, a futuro, Actividades).
 * El cálculo de % → letra reutiliza `percentageToReportLevel`
 * (`@/utils/reportGrade`, ADR-008) en vez de definir una tercera escala: el
 * propio Sprint 17 pide exactamente esos mismos cortes (90/80/70/60).
 */

export type RubricLevel = 'excelente' | 'bueno' | 'suficiente' | 'insuficiente'

export const RUBRIC_LEVELS: RubricLevel[] = ['excelente', 'bueno', 'suficiente', 'insuficiente']

export const RUBRIC_LEVEL_LABELS: Record<RubricLevel, string> = {
  excelente: 'Excelente',
  bueno: 'Bueno',
  suficiente: 'Suficiente',
  insuficiente: 'Insuficiente',
}

/** Fracción del peso del criterio que se obtiene al marcar cada nivel. */
export const RUBRIC_LEVEL_FACTOR: Record<RubricLevel, number> = {
  excelente: 1,
  bueno: 0.85,
  suficiente: 0.7,
  insuficiente: 0.4,
}

/** Definición de un criterio dentro de una rúbrica. Editable por el profesor. */
export interface RubricCriterionDefinition {
  id: string
  name: string
  /** Puntos que aporta este criterio dentro del 100% de la rúbrica. */
  weight: number
}

/** Calificación de un criterio para una entrega/evaluación puntual. */
export interface RubricCriterionScore {
  criterionId: string
  level: RubricLevel
  comments?: string
}

export interface RubricScoreResult {
  scores: RubricCriterionScore[]
  bonus: number
  percentage: number
  letter: ReportGradeLevel
}
