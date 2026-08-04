/**
 * Tipos del sistema de Leaderboard y Gamificación (Sprint Leaderboard).
 *
 * La gamificación no es un módulo independiente: es consecuencia del flujo de
 * Evaluaciones ya existente (Profesor evalúa % → asigna badges → registra
 * movimientos de puntos). Estos tipos extienden ese flujo; no reemplazan nada.
 */

/** Catálogo cerrado de acciones de puntos. El profesor solo puede elegir una; nunca escribe un número. */
export type PointActionId =
  | 'reporte_entregado'
  | 'experto'
  | 'pitch'
  | 'empresa_nueva'
  | 'pregunta_foro'
  | 'respuesta_foro'
  | 'consulta_foro'
  | 'tardanza'
  | 'ausencia'

export interface PointCatalogEntry {
  id: PointActionId
  label: string
  points: number
}

/** Movimiento de puntos registrado por el profesor sobre un alumno. */
export interface PointMovement {
  id: string
  studentId: string
  subjectId: string
  actionId: PointActionId
  label: string
  points: number
  registeredBy: string
  createdAt: string
}

/** Estado del alumno derivado de su puntaje total (ver `@/mocks/gamification`). */
export type StudentGamificationStatus = 'destacado' | 'activo' | 'en_riesgo'

/** Ids de las 6 insignias que calcula el sistema automáticamente. */
export type AutomaticBadgeId =
  | 'badge-auto-iniciador'
  | 'badge-auto-consultor'
  | 'badge-auto-campeon'
  | 'badge-auto-racha-oro'
  | 'badge-auto-colaborador'
  | 'badge-auto-nivel-elite'

/** Cambio de posición respecto al ranking anterior (simplificado para el MVP, ver TDD). */
export type RankMovement = 'up' | 'down' | 'same'

/** Fila del Leaderboard: un alumno con su puntaje, insignias y posición ya calculados. */
export interface LeaderboardEntry {
  studentId: string
  studentName: string
  subjectId: string
  subjectName: string
  groupName: string
  career: string
  term: number
  titulacionProgress: number
  totalPoints: number
  bonus: number
  status: StudentGamificationStatus
  badgeIds: string[]
  rank: number
  rankMovement: RankMovement
}
