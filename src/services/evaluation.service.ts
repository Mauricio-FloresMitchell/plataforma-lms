import {
  findEvaluationById,
  getAdminEvaluations,
  getAvailableBadges,
  getEvaluationBadgeIds,
  getEvaluationSummary,
  getProfessorStudentEvaluations,
  getStudentEvaluationDetail,
  getStudentEvaluations,
  recordEvaluation,
} from '@/mocks/evaluations'
import { emitAppEvent } from '@/core/events/EventBus'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type {
  Badge,
  Competency,
  EvaluationSummary,
  FeedbackStatus,
  StudentEvaluation,
  StudentEvaluationDetail,
} from '@/types/evaluation'
import type { RubricCriterionScore } from '@/types/rubric'

/**
 * Capa de acceso a datos para el módulo de Evaluaciones.
 *
 * Es el único archivo que conoce el origen de los datos.
 * Migrar a Google Sheets, API REST o PostgreSQL implica reemplazar el cuerpo
 * de estas funciones; la firma pública y los componentes no cambian.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getStudentEvaluationsAsync(
  studentId: string,
): Promise<StudentEvaluation[]> {
  await delay(NETWORK_DELAY_MS)
  return getStudentEvaluations(studentId)
}

export async function getStudentEvaluationDetailAsync(
  evaluationId: string,
): Promise<StudentEvaluationDetail | null> {
  await delay(NETWORK_DELAY_MS)
  return getStudentEvaluationDetail(evaluationId)
}

export async function getProfessorStudentEvaluationsAsync(
  subjectId: string,
): Promise<StudentEvaluation[]> {
  await delay(NETWORK_DELAY_MS)
  return getProfessorStudentEvaluations(subjectId)
}

export interface RecordEvaluationExtra {
  rubricAScores?: RubricCriterionScore[]
  rubricBScores?: RubricCriterionScore[]
  bonus?: number
  observations?: string
}

export async function recordEvaluationAsync(
  evaluationId: string,
  competencies: Competency[],
  feedback: string | undefined,
  status: FeedbackStatus,
  badgeIds: string[],
  actor?: AuditActor,
  extra?: RecordEvaluationExtra,
): Promise<StudentEvaluation | null> {
  await delay(NETWORK_DELAY_MS)
  const previousBadgeIds = new Set(getEvaluationBadgeIds(evaluationId))
  const existing = actor ? findEvaluationById(evaluationId) : null
  const before = existing ? structuredClone(existing) : null
  const updated = recordEvaluation(evaluationId, competencies, feedback, status, badgeIds, {
    ...extra,
    evaluatedByName: actor?.name,
  })

  if (updated) {
    if (actor) {
      recordAudit(
        actor,
        'Evaluaciones',
        status === 'publicada'
          ? `Publicó la evaluación de ${updated.studentName} — ${updated.subjectName}`
          : `Guardó un borrador de evaluación de ${updated.studentName} — ${updated.subjectName}`,
        before ?? undefined,
        updated,
      )
    }
    if (status === 'publicada') {
      emitAppEvent('GRADE_UPDATED', {
        evaluationId: updated.id,
        studentId: updated.studentId,
        subjectId: updated.subjectId,
        subjectName: updated.subjectName,
        status: updated.status,
      })
    }

    const newBadgeIds = badgeIds.filter((id) => !previousBadgeIds.has(id))
    if (newBadgeIds.length > 0) {
      const catalog = getAvailableBadges()
      for (const badgeId of newBadgeIds) {
        const badge = catalog.find((item) => item.id === badgeId)
        if (!badge) continue
        emitAppEvent('BADGE_GRANTED', {
          studentId: updated.studentId,
          studentName: updated.studentName,
          badgeId: badge.id,
          badgeName: badge.name,
          badgeIcon: badge.icon,
        })
      }
    }
  }

  return updated
}

/**
 * Edición de una evaluación por el Administrador (Sprint 13, Parte 7).
 * Requiere `reason` (motivo obligatorio) y siempre queda auditada con el
 * valor anterior y el nuevo — nunca elimina la evaluación.
 */
export async function updateEvaluationAsAdminAsync(
  actor: AuditActor,
  evaluationId: string,
  competencies: Competency[],
  feedback: string | undefined,
  status: FeedbackStatus,
  reason: string,
): Promise<StudentEvaluation | null> {
  await delay(NETWORK_DELAY_MS)
  const existing = findEvaluationById(evaluationId)
  if (!existing) return null

  const before = structuredClone(existing)
  const updated = recordEvaluation(evaluationId, competencies, feedback, status, existing.badgeIds ?? [])
  if (updated) {
    recordAudit(actor, 'Evaluaciones', `Editó la evaluación de ${updated.studentName} — Motivo: ${reason}`, before, updated)
  }
  return updated
}

export async function getEvaluationSummaryAsync(): Promise<EvaluationSummary> {
  await delay(NETWORK_DELAY_MS)
  return getEvaluationSummary()
}

export async function getAdminEvaluationsAsync(): Promise<StudentEvaluation[]> {
  await delay(NETWORK_DELAY_MS)
  return getAdminEvaluations()
}

export async function getAvailableBadgesAsync(): Promise<Badge[]> {
  await delay(NETWORK_DELAY_MS)
  return getAvailableBadges()
}
