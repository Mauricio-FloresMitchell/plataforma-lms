import type { StudentVote, VoteStatus } from '@/types/vote'

/**
 * Almacén simulado de Votación entre alumnos (Sprint Leaderboard).
 * Estado en memoria durante la sesión, mismo criterio que el resto de los
 * mocks del proyecto.
 */

let sequence = 0
function nextId(): string {
  sequence += 1
  return `vote-${sequence}`
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

/** Voto sembrado para que la cola de revisión del profesor no arranque vacía. */
let VOTES: StudentVote[] = [
  {
    id: nextId(),
    subjectId: 'sub-001',
    voterId: 'std-002',
    voterName: 'Axel Martínez Betanzos',
    candidateId: 'usr-alumno-001',
    candidateName: 'Andrea Guadalupe Mendez Guzman',
    reason: 'Explicó muy claro la propuesta de valor en el breakout room.',
    status: 'pendiente',
    createdAt: daysAgo(1),
  },
]

export function listVotesForSubject(subjectId: string, status?: VoteStatus): StudentVote[] {
  return VOTES.filter((vote) => vote.subjectId === subjectId && (!status || vote.status === status)).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function findPendingVoteByVoter(subjectId: string, voterId: string): StudentVote | null {
  return VOTES.find((vote) => vote.subjectId === subjectId && vote.voterId === voterId && vote.status === 'pendiente') ?? null
}

export function findVote(voteId: string): StudentVote | null {
  return VOTES.find((vote) => vote.id === voteId) ?? null
}

/** Registra un voto nuevo. Devuelve `null` si el votante ya tiene un voto pendiente (regla anti-spam del sprint). */
export function castVote(
  subjectId: string,
  voterId: string,
  voterName: string,
  candidateId: string,
  candidateName: string,
  reason?: string,
): StudentVote | null {
  if (findPendingVoteByVoter(subjectId, voterId)) return null

  const vote: StudentVote = {
    id: nextId(),
    subjectId,
    voterId,
    voterName,
    candidateId,
    candidateName,
    reason,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  }
  VOTES = [vote, ...VOTES]
  return vote
}

export function resolveVote(voteId: string, status: Extract<VoteStatus, 'aceptado' | 'rechazado'>, resolvedByName: string): StudentVote | null {
  const vote = VOTES.find((item) => item.id === voteId)
  if (!vote || vote.status !== 'pendiente') return null
  vote.status = status
  vote.resolvedAt = new Date().toISOString()
  vote.resolvedByName = resolvedByName
  return vote
}
