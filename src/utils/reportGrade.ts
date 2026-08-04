import type { ReportGradeLevel } from '@/types/report'

/**
 * Escala de la Evaluación Docente de Reportes (Sprint 12, ADR-008).
 * Independiente de la escala de 8 niveles de Evaluaciones por competencias
 * (RN-005/ADR-007, ver `@/utils/grade`): esta es exclusiva del bloque
 * "Evaluación Docente" del módulo de Reportes.
 */
const REPORT_GRADE_THRESHOLDS: { min: number; level: ReportGradeLevel }[] = [
  { min: 90, level: 'A' },
  { min: 80, level: 'B' },
  { min: 70, level: 'C' },
  { min: 60, level: 'D' },
  { min: 0, level: 'F' },
]

/** Convierte un porcentaje (0-100) a la letra de la escala de Reportes. Ej: 92 → "A". */
export function percentageToReportLevel(percentage: number): ReportGradeLevel {
  const clamped = Math.max(0, Math.min(100, percentage))
  const match = REPORT_GRADE_THRESHOLDS.find((t) => clamped >= t.min)
  return match?.level ?? 'F'
}

/**
 * Calcula el porcentaje final de la Evaluación Docente: Rúbrica A (70%) +
 * Rúbrica B (30%) + bonificación. El profesor nunca calcula manualmente:
 * solo captura `rubricA`, `rubricB` (0-100 cada una) y `bonus` (puntos extra).
 */
export function calculateFinalPercentage(rubricA: number, rubricB: number, bonus: number): number {
  const weighted = rubricA * 0.7 + rubricB * 0.3 + bonus
  return Math.max(0, Math.min(100, Math.round(weighted)))
}
