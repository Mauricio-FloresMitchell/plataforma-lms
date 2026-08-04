import type { CompetencyLevel } from '@/types/evaluation'

/** Tabla de equivalencias porcentaje → letra (PRD RN-005, ADR-007). */
const GRADE_THRESHOLDS: { min: number; level: CompetencyLevel }[] = [
  { min: 97, level: 'A+' },
  { min: 90, level: 'A' },
  { min: 85, level: 'B+' },
  { min: 80, level: 'B' },
  { min: 75, level: 'C+' },
  { min: 70, level: 'C' },
  { min: 60, level: 'D' },
  { min: 0, level: 'F' },
]

/** Convierte un porcentaje (0-100) a la letra correspondiente. Ej: 92 → "A". */
export function percentageToLevel(percentage: number): CompetencyLevel {
  const clamped = Math.max(0, Math.min(100, percentage))
  const match = GRADE_THRESHOLDS.find((t) => clamped >= t.min)
  return match?.level ?? 'F'
}
