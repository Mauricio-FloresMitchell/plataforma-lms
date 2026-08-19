import type { ReportGradeLevel, ReportStatus } from '@/types/report'
import type { RubricCriterionDefinition, RubricScoreResult } from '@/types/rubric'

/**
 * Escala institucional de evaluación por competencias (PRD RN-005, ADR-007).
 * La evaluación oficial del alumno es una letra. Desde el Sprint Demo Profesor,
 * el profesor la captura como porcentaje (0-100); ver `@/utils/grade`.
 */
export type CompetencyLevel = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'

/** Estado del reporte semanal del alumno, visible en el listado de evaluación por materia. */
export type WeeklyReportStatus = ReportStatus | 'sin_reporte'

/** Niveles ordenados de mayor a menor, para selects y leyendas. */
export const COMPETENCY_LEVELS: CompetencyLevel[] = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']

/**
 * Tipos para el módulo de Evaluaciones (Sprint 8; ampliado en el Sprint Demo Profesor).
 */

export interface Competency {
  id: string
  name: string
  description: string
  currentLevel: CompetencyLevel
  /** Porcentaje capturado por el profesor (0-100). Determina `currentLevel`. */
  percentage: number
}

/**
 * Estado de publicación de la retroalimentación.
 * - pendiente: el profesor aún no ha capturado nada.
 * - borrador: el profesor guardó avances; no visible para el alumno.
 * - publicada: visible para el alumno; solo puede modificarse mediante
 *   solicitud al Administrador (PRD §12.5).
 */
export type FeedbackStatus = 'pendiente' | 'borrador' | 'publicada'

/**
 * Criterios de las dos rúbricas del Modelo Educativo Imperalianz (Sprint 17,
 * Parte 4/5): Rúbrica A (70%, Deliverable de Consultoría) + Rúbrica B (30%,
 * Participación y Colaboración). Mismo peso 70/30 y mismo cálculo
 * (`calculateFinalPercentage`, `@/utils/reportGrade`, ADR-008) que ya usa la
 * Evaluación Docente de Reportes — no se inventó una tercera fórmula.
 *
 * Nomenclatura y pesos de Rúbrica A alineados al manual de capacitación
 * docente ("Guion_Capacitacion_Docente", Mejora 4 — Rúbricas Maestras de
 * Evaluación): 4 criterios de 25% cada uno, no 3 criterios de 40/30/30.
 */
export const RUBRIC_A_CRITERIA: RubricCriterionDefinition[] = [
  { id: 'rubrica-a-avance', name: 'Avance real en el proyecto propio', weight: 25 },
  { id: 'rubrica-a-conexion', name: 'Conexión con el caso de consultoría', weight: 25 },
  { id: 'rubrica-a-calidad', name: 'Calidad y profundidad del análisis', weight: 25 },
  { id: 'rubrica-a-redaccion', name: 'Redacción y presentación', weight: 25 },
]

export const RUBRIC_B_CRITERIA: RubricCriterionDefinition[] = [
  { id: 'rubrica-b-puntualidad', name: 'Puntualidad y compromiso', weight: 50 },
  { id: 'rubrica-b-participacion', name: 'Participación', weight: 50 },
]

export interface StudentEvaluation {
  id: string
  studentId: string
  studentName: string
  subjectId: string
  subjectName: string
  groupName: string
  evaluatedAt: string
  competencies: Competency[]
  /** Retroalimentación dirigida al alumno (distinta de `observations`, de uso interno). */
  feedback?: string
  status: FeedbackStatus
  /** Ids de las insignias asignadas en esta evaluación. */
  badgeIds?: string[]
  /** Empresa donde el alumno realiza su práctica. Solo poblado en el listado del Profesor. */
  company?: string
  /** Estado del reporte semanal más reciente del alumno en esta materia. Solo poblado en el listado del Profesor. */
  weeklyReportStatus?: WeeklyReportStatus
  /** Carrera del alumno (Sprint Leaderboard). Solo poblado en el roster del Profesor. */
  career?: string
  /** Cuatrimestre en curso (1-9, Sprint Leaderboard). Solo poblado en el roster del Profesor. */
  term?: number
  /** Avance del producto de titulación en porcentaje (Sprint Leaderboard). Solo poblado en el roster del Profesor. */
  titulacionProgress?: number
  /** Rúbrica A (70%) — dominio académico (Sprint 17, Parte 4). */
  rubricA?: RubricScoreResult
  /** Rúbrica B (30%) — desempeño/actitud (Sprint 17, Parte 4). */
  rubricB?: RubricScoreResult
  /** Observaciones internas del profesor, distintas de la retroalimentación dirigida al alumno. */
  observations?: string
  /** Número de veces que se ha guardado esta evaluación (Sprint 17, "Intentos"). */
  attempts?: number
  /** Nombre del profesor que evaluó (Sprint 17, "Profesor evaluador"). */
  evaluatedByName?: string
  /** Puntos extra sumados una sola vez al combinar Rúbrica A + Rúbrica B (`calculateFinalPercentage`). */
  bonus?: number
  /** % final = Rúbrica A × 70% + Rúbrica B × 30% + bonificación (`calculateFinalPercentage`). */
  finalPercentage?: number
  /** Letra derivada de `finalPercentage` (escala de 5 niveles, ADR-008): A/B/C/D/F. */
  finalLetter?: ReportGradeLevel
}

export interface StudentEvaluationDetail {
  id: string
  studentId: string
  studentName: string
  email: string
  subjectId: string
  subjectName: string
  groupName: string
  competencies: Competency[]
  feedback?: string
  status: FeedbackStatus
  badges: Badge[]
  rubricA?: RubricScoreResult
  rubricB?: RubricScoreResult
  observations?: string
  attempts?: number
  evaluatedByName?: string
  bonus?: number
  finalPercentage?: number
  finalLetter?: ReportGradeLevel
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt?: string
  /**
   * Origen de la insignia (Sprint Leaderboard). 'manual' (default si se omite,
   * por compatibilidad con insignias previas): el profesor la otorga durante
   * una evaluación. 'automatic': la calcula el sistema a partir de los
   * movimientos de puntos del alumno, ver `@/mocks/gamification`.
   */
  awardType?: 'manual' | 'automatic'
}

export interface EvaluationSummary {
  totalEvaluations: number
  pendingEvaluations: number
  draftEvaluations: number
  completedEvaluations: number
  averageCompetencyLevel: CompetencyLevel
}
