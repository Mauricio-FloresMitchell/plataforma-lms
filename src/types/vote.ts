/**
 * Tipos de Votación entre alumnos (Sprint Leaderboard).
 *
 * Modela "Mejor solución del breakout room (votación del grupo)" del Manual
 * de Mejoras Transversales como nominaciones individuales: un alumno vota por
 * un compañero (nunca por sí mismo); el profesor acepta o rechaza cada voto
 * desde el Leaderboard. Aceptar un voto registra el mismo movimiento de
 * puntos que cualquier otra acción del catálogo (`@/mocks/gamification`) —
 * la votación no crea un mecanismo de puntos paralelo.
 */

export type VoteStatus = 'pendiente' | 'aceptado' | 'rechazado'

export interface StudentVote {
  id: string
  subjectId: string
  voterId: string
  voterName: string
  candidateId: string
  candidateName: string
  reason?: string
  status: VoteStatus
  createdAt: string
  resolvedAt?: string
  resolvedByName?: string
}
