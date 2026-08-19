import { castVote, findPendingVoteByVoter, findVote, listVotesForSubject, resolveVote } from '@/mocks/votes'
import { recordPointMovementAsync } from '@/services/gamification.service'
import { emitAppEvent } from '@/core/events/EventBus'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { StudentVote } from '@/types/vote'

/**
 * Capa de acceso a datos de Votación entre alumnos (Sprint Leaderboard).
 *
 * "Aceptar" un voto reutiliza `recordPointMovementAsync` (mismo ledger que
 * cualquier otra acción del catálogo de puntos) — no existe un mecanismo de
 * puntos paralelo para los votos.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Voto pendiente del alumno en sesión, si tiene uno (regla: un voto pendiente a la vez). */
export async function getMyPendingVoteAsync(subjectId: string, voterId: string): Promise<StudentVote | null> {
  await delay(NETWORK_DELAY_MS)
  return findPendingVoteByVoter(subjectId, voterId)
}

/** Cola de votos pendientes de revisión del Profesor. */
export async function listPendingVotesAsync(subjectId: string): Promise<StudentVote[]> {
  await delay(NETWORK_DELAY_MS)
  return listVotesForSubject(subjectId, 'pendiente')
}

/**
 * Registra el voto de un alumno por un compañero. `null` si el votante ya
 * tiene un voto pendiente sin resolver — la UI es responsable de impedir el
 * envío en ese caso, pero el mock valida de nuevo por seguridad.
 */
export async function castVoteAsync(
  subjectId: string,
  subjectName: string,
  voter: AuditActor,
  candidateId: string,
  candidateName: string,
  reason?: string,
): Promise<StudentVote | null> {
  await delay(NETWORK_DELAY_MS)
  const vote = castVote(subjectId, voter.id, voter.name, candidateId, candidateName, reason)
  if (!vote) return null

  emitAppEvent('VOTE_CAST', {
    voteId: vote.id,
    subjectId,
    subjectName,
    voterId: voter.id,
    voterName: voter.name,
    candidateId,
    candidateName,
    reason,
  })
  recordAudit(voter, 'Leaderboard', `Votó por ${candidateName} en ${subjectName}`)
  return vote
}

/** El profesor acepta el voto: registra +15 pts ("Mejor solución del breakout room") y lo marca resuelto. */
export async function acceptVoteAsync(voteId: string, actor: AuditActor): Promise<StudentVote | null> {
  await delay(NETWORK_DELAY_MS)
  const vote = findVote(voteId)
  if (!vote || vote.status !== 'pendiente') return null

  await recordPointMovementAsync(vote.candidateId, vote.subjectId, 'mejor_solucion_breakout', actor.name, actor)
  const resolved = resolveVote(voteId, 'aceptado', actor.name)
  if (resolved) {
    recordAudit(actor, 'Leaderboard', `Aceptó el voto de ${vote.voterName} por ${vote.candidateName}`)
  }
  return resolved
}

/** El profesor rechaza el voto: no otorga puntos, solo lo marca resuelto. */
export async function rejectVoteAsync(voteId: string, actor: AuditActor): Promise<StudentVote | null> {
  await delay(NETWORK_DELAY_MS)
  const vote = findVote(voteId)
  const resolved = resolveVote(voteId, 'rechazado', actor.name)
  if (resolved && vote) {
    recordAudit(actor, 'Leaderboard', `Rechazó el voto de ${vote.voterName} por ${vote.candidateName}`)
  }
  return resolved
}
