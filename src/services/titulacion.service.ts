import { getTitulacionRepository } from '@/repositories/titulacion.repository'
import { emitAppEvent } from '@/core/events/EventBus'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type {
  TitulacionEvidenceKind,
  TitulacionFeedbackType,
  TitulacionFile,
  TitulacionPhase,
  TitulacionProduct,
  TitulacionProductStatus,
} from '@/types/titulacion'

/**
 * Capa de servicio del Producto de Titulación (Sprint 18).
 *
 * Único punto que combina el repositorio (`repositories/titulacion.repository.ts`,
 * hoy en memoria, mañana una API real sin cambiar esta firma) con
 * transversales de la plataforma: Event Bus y Auditoría — el repositorio
 * nunca los conoce, solo persiste datos.
 */

const repository = getTitulacionRepository()

export async function getTitulacionProductAsync(studentId: string): Promise<TitulacionProduct | null> {
  return repository.getProduct(studentId)
}

/** Roster de proyectos (vista del Profesor/Administrador). */
export async function listTitulacionProductsAsync(): Promise<TitulacionProduct[]> {
  return repository.listProducts()
}

export async function saveTitulacionDraftAsync(
  studentId: string,
  phaseId: string,
  deliverableId: string,
  draftContent: string,
  files: TitulacionFile[],
): Promise<void> {
  await repository.saveDeliverableDraft(studentId, phaseId, deliverableId, draftContent, files)
}

/** El alumno publica la versión final de una fase (Sprint 18, Parte 5): incrementa versión, nunca sobrescribe. */
export async function publishTitulacionPhaseAsync(
  studentId: string,
  phaseId: string,
  student: { id: string; name: string },
  comment: string,
): Promise<TitulacionPhase | null> {
  const phase = await repository.publishPhase(studentId, phaseId, student, comment)
  if (phase) {
    emitAppEvent('TITULACION_PHASE_SUBMITTED', { studentId, studentName: student.name, phaseId: phase.id, phaseName: phase.title })
  }
  return phase
}

/** Duplica una versión anterior como nuevo borrador editable (Sprint 18, Parte 5). */
export async function duplicateTitulacionPhaseVersionAsync(
  studentId: string,
  phaseId: string,
  versionNumber: number,
  student: { id: string; name: string },
): Promise<TitulacionPhase | null> {
  return repository.duplicatePhaseVersion(studentId, phaseId, versionNumber, student)
}

/** Retroalimentación del profesor sobre una fase (Sprint 18, Parte 6): comentario, solicitud de cambios u observación. */
export async function addTitulacionPhaseFeedbackAsync(
  actor: AuditActor,
  studentId: string,
  studentName: string,
  phaseId: string,
  type: Exclude<TitulacionFeedbackType, 'aprobacion' | 'rechazo'>,
  content: string,
): Promise<TitulacionPhase | null> {
  const phase = await repository.addPhaseFeedback(studentId, phaseId, { type, authorId: actor.id, authorName: actor.name, content })
  if (phase) {
    recordAudit(actor, 'Producto de Titulación', `Retroalimentó "${phase.title}" de ${studentName} (${type})`)
  }
  return phase
}

export async function reviewTitulacionPhaseAsync(
  actor: AuditActor,
  studentId: string,
  studentName: string,
  phaseId: string,
  action: 'aprobada' | 'rechazada',
  feedback: string,
): Promise<TitulacionPhase | null> {
  const phase = await repository.reviewPhase(studentId, phaseId, action, feedback, actor)
  if (phase) {
    recordAudit(actor, 'Producto de Titulación', `${action === 'aprobada' ? 'Aprobó' : 'Rechazó'} "${phase.title}" de ${studentName} — ${feedback}`)
    emitAppEvent('TITULACION_PHASE_REVIEWED', {
      studentId,
      studentName,
      phaseId: phase.id,
      phaseName: phase.title,
      action,
      reviewedByName: actor.name,
    })
  }
  return phase
}

export async function addTitulacionObservationAsync(
  actor: AuditActor,
  studentId: string,
  studentName: string,
  observation: string,
): Promise<TitulacionProduct | null> {
  const product = await repository.addProductObservation(studentId, observation, actor)
  if (product) {
    recordAudit(actor, 'Producto de Titulación', `Agregó una observación al proyecto de ${studentName}`)
  }
  return product
}

/** Registra la descarga de un archivo (Sprint 18, Parte 11: "descargó" en el historial). */
export async function recordTitulacionFileDownloadAsync(actor: AuditActor, studentId: string, fileId: string): Promise<void> {
  await repository.recordFileDownload(studentId, fileId, actor)
}

// ---------------------------------------------------------------------------
// Administrador (Sprint 18, Parte 12)
// ---------------------------------------------------------------------------

export async function reassignTitulacionProfessorAsync(
  actor: AuditActor,
  studentId: string,
  professorId: string,
  professorName: string,
): Promise<TitulacionProduct | null> {
  const product = await repository.reassignProfessor(studentId, professorId, professorName, actor)
  if (product) recordAudit(actor, 'Producto de Titulación', `Reasignó el profesor de ${product.studentName} a ${professorName}`)
  return product
}

export async function unlockTitulacionPhaseAsync(actor: AuditActor, studentId: string, phaseId: string): Promise<TitulacionPhase | null> {
  const phase = await repository.unlockPhase(studentId, phaseId, actor)
  if (phase) recordAudit(actor, 'Producto de Titulación', `Desbloqueó "${phase.title}"`)
  return phase
}

export async function setTitulacionProductStatusAsync(
  actor: AuditActor,
  studentId: string,
  status: TitulacionProductStatus,
  reason?: string,
): Promise<TitulacionProduct | null> {
  const product = await repository.setProductStatus(studentId, status, actor, reason)
  if (product) recordAudit(actor, 'Producto de Titulación', `Cambió el estado de ${product.studentName} a "${status}"${reason ? ` — ${reason}` : ''}`)
  return product
}

export async function closeTitulacionProductAsync(actor: AuditActor, studentId: string, reason?: string): Promise<TitulacionProduct | null> {
  return setTitulacionProductStatusAsync(actor, studentId, 'cerrado', reason)
}

// ---------------------------------------------------------------------------
// Sincronización automática (Sprint 18, Parte 7) — punto único que usan los
// listeners del Event Bus para adjuntar evidencia; ningún listener escribe
// directamente al repositorio.
// ---------------------------------------------------------------------------

export async function attachTitulacionEvidenceAsync(
  studentId: string,
  evidence: { kind: TitulacionEvidenceKind; label: string; link?: string },
  historyDetail: string,
  sourceModule: string,
): Promise<void> {
  await repository.attachEvidence(studentId, evidence, historyDetail, sourceModule)
}
