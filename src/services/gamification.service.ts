import { addBadgeToStudent, getAvailableBadges, getGamificationSubjectIds, getSubjectRosterForGamification, removeBadgeFromStudent } from '@/mocks/evaluations'
import {
  calculateAutomaticBadgeIds,
  calculateBonus,
  calculateStatus,
  calculateTotalPoints,
  getPointCatalog,
  listAllPointMovements,
  listPointMovements,
  recordPointMovement,
  resetSeason,
} from '@/mocks/gamification'
import { emitAppEvent } from '@/core/events/EventBus'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type { StudentEvaluation } from '@/types/evaluation'
import type {
  LeaderboardEntry,
  PointActionId,
  PointCatalogEntry,
  PointMovement,
  RankMovement,
} from '@/types/gamification'

/**
 * Capa de acceso a datos de Leaderboard y Gamificación.
 *
 * Compone dos mocks (`@/mocks/evaluations` para el roster académico y
 * `@/mocks/gamification` para los movimientos de puntos), siguiendo el mismo
 * patrón ya usado por `announcement.service.ts` para coordinar más de un
 * store. No modifica ninguno de los dos: solo los combina.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Cambio de posición respecto al ranking anterior. El MVP no conserva
 * snapshots históricos del ranking (no hay persistencia entre sesiones), así
 * que se deriva de forma determinística del id del alumno — es una señal de
 * ejemplo para la flecha ▲▼=, no un cálculo real sobre historial. Documentado
 * en TDD.
 */
function deterministicRankMovement(studentId: string): RankMovement {
  const code = studentId.charCodeAt(studentId.length - 1)
  if (code % 3 === 0) return 'up'
  if (code % 3 === 1) return 'down'
  return 'same'
}

function buildLeaderboard(roster: StudentEvaluation[]): LeaderboardEntry[] {
  const withPoints = roster.map((student) => {
    const movements = listPointMovements(student.subjectId, student.studentId)
    return { student, movements, totalPoints: calculateTotalPoints(movements) }
  })

  const ranked = [...withPoints].sort((a, b) => b.totalPoints - a.totalPoints)

  return ranked.map(({ student, movements, totalPoints }, index) => {
    const rank = index + 1
    const isTopOfSubject = rank === 1 && totalPoints > 0
    const badgeIds = Array.from(
      new Set([
        ...(student.badgeIds ?? []),
        ...calculateAutomaticBadgeIds(movements, totalPoints, isTopOfSubject),
      ]),
    )

    return {
      studentId: student.studentId,
      studentName: student.studentName,
      subjectId: student.subjectId,
      subjectName: student.subjectName,
      groupName: student.groupName,
      career: student.career ?? 'Sin carrera',
      term: student.term ?? 1,
      titulacionProgress: student.titulacionProgress ?? 0,
      totalPoints,
      bonus: calculateBonus(totalPoints),
      status: calculateStatus(totalPoints),
      badgeIds,
      rank,
      rankMovement: deterministicRankMovement(student.studentId),
    }
  })
}

/** Leaderboard de una materia (vista del Profesor, o de un Alumno filtrando su propia fila). */
export async function getSubjectLeaderboardAsync(subjectId: string): Promise<LeaderboardEntry[]> {
  await delay(NETWORK_DELAY_MS)
  return buildLeaderboard(getSubjectRosterForGamification(subjectId))
}

/** Leaderboard global (vista del Administrador): todas las materias del Profesor, un solo ranking. */
export async function getGlobalLeaderboardAsync(): Promise<LeaderboardEntry[]> {
  await delay(NETWORK_DELAY_MS)
  const roster = getGamificationSubjectIds().flatMap((subjectId) => getSubjectRosterForGamification(subjectId))
  return buildLeaderboard(roster)
}

/** Fila de Leaderboard de un alumno específico (widgets "Mi Ranking" del Dashboard del Alumno). */
export async function getStudentLeaderboardEntryAsync(
  subjectId: string,
  studentId: string,
): Promise<LeaderboardEntry | null> {
  const entries = await getSubjectLeaderboardAsync(subjectId)
  return entries.find((entry) => entry.studentId === studentId) ?? null
}

export async function getPointCatalogAsync(): Promise<PointCatalogEntry[]> {
  await delay(NETWORK_DELAY_MS)
  return getPointCatalog()
}

export async function listPointMovementsAsync(subjectId: string, studentId?: string): Promise<PointMovement[]> {
  await delay(NETWORK_DELAY_MS)
  return listPointMovements(subjectId, studentId)
}

/**
 * Registra un movimiento de puntos. `actionId` viene siempre del catálogo
 * cerrado (`getPointCatalogAsync`) — la UI nunca envía un número libre.
 * Es una transacción del Ledger (Sprint 17, Parte 7): nunca modifica un
 * total almacenado, solo agrega un movimiento — `calculateTotalPoints` suma
 * todos los movimientos en cada lectura. Queda auditado (Parte 15).
 */
export async function recordPointMovementAsync(
  studentId: string,
  subjectId: string,
  actionId: PointActionId,
  registeredBy: string,
  actor?: AuditActor,
): Promise<PointMovement> {
  await delay(NETWORK_DELAY_MS)
  const movement = recordPointMovement(studentId, subjectId, actionId, registeredBy)
  const studentName =
    getSubjectRosterForGamification(subjectId).find((student) => student.studentId === studentId)?.studentName ??
    studentId
  emitAppEvent(movement.points >= 0 ? 'POINTS_GRANTED' : 'POINTS_REMOVED', {
    studentId,
    studentName,
    subjectId,
    points: movement.points,
    actionLabel: movement.label,
  })
  if (actor) {
    recordAudit(actor, 'Leaderboard', `Registró "${movement.label}" (${movement.points >= 0 ? '+' : ''}${movement.points} pts) a ${studentName}`)
  }
  return movement
}

// ---------------------------------------------------------------------------
// Administración del Leaderboard (Sprint 13, Parte 8)
//
// No cambia cómo se calcula el ranking (`buildLeaderboard` sigue siendo la
// única fuente): estas funciones solo administran los datos que alimentan
// ese cálculo (movimientos de puntos, insignias) y quedan auditadas.
// ---------------------------------------------------------------------------

export async function listAllPointMovementsAsync(): Promise<PointMovement[]> {
  await delay(NETWORK_DELAY_MS)
  return listAllPointMovements()
}

/** "Recalcular ranking": el ranking ya se deriva en vivo en cada lectura — esto solo confirma y audita la acción. */
export async function recalculateLeaderboardAsync(actor: AuditActor): Promise<void> {
  await delay(NETWORK_DELAY_MS)
  recordAudit(actor, 'Leaderboard', 'Recalculó el ranking')
}

/** "Reiniciar temporada": limpia todos los movimientos de puntos de todas las materias. Acción destructiva, requiere confirmación en la UI. */
export async function resetSeasonAsync(actor: AuditActor): Promise<void> {
  await delay(NETWORK_DELAY_MS)
  resetSeason()
  recordAudit(actor, 'Leaderboard', 'Reinició la temporada (se limpiaron todos los movimientos de puntos)')
}

export async function assignBadgeManuallyAsync(
  actor: AuditActor,
  studentId: string,
  studentName: string,
  subjectId: string,
  badgeId: string,
): Promise<void> {
  await delay(NETWORK_DELAY_MS)
  const updated = addBadgeToStudent(studentId, subjectId, badgeId)
  if (!updated) return
  const badge = getAvailableBadges().find((item) => item.id === badgeId)
  if (!badge) return
  emitAppEvent('BADGE_GRANTED', { studentId, studentName, badgeId: badge.id, badgeName: badge.name, badgeIcon: badge.icon })
  recordAudit(actor, 'Leaderboard', `Otorgó manualmente la insignia "${badge.name}" a ${studentName}`)
}

export async function revokeBadgeManuallyAsync(
  actor: AuditActor,
  studentId: string,
  studentName: string,
  subjectId: string,
  badgeId: string,
): Promise<void> {
  await delay(NETWORK_DELAY_MS)
  const updated = removeBadgeFromStudent(studentId, subjectId, badgeId)
  if (!updated) return
  const badge = getAvailableBadges().find((item) => item.id === badgeId)
  if (!badge) return
  emitAppEvent('BADGE_REVOKED', { studentId, studentName, badgeId: badge.id, badgeName: badge.name, badgeIcon: badge.icon })
  recordAudit(actor, 'Leaderboard', `Quitó la insignia "${badge.name}" a ${studentName}`)
}
