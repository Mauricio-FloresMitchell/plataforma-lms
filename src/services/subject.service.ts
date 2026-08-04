import {
  assignAdminSubjectProfessor,
  createActivity,
  createAdminSubject,
  createMaterial,
  createSubjectAnnouncement,
  deleteActivity,
  deleteAdminSubject,
  deleteMaterial,
  duplicateActivity,
  findAdminSubject,
  getActivity,
  getActivitySubmission,
  getAdminSubjects,
  getProfessorSubjects,
  getStudentSubjects,
  getSubjectDetail,
  setActivityHidden,
  setAdminSubjectActive,
  setMaterialHidden,
  updateActivity,
  updateAdminSubject,
  upsertActivitySubmission,
} from '@/mocks/subjects'
import { findCareer } from '@/mocks/careers'
import { emitAppEvent } from '@/core/events/EventBus'
import { recordAudit, type AuditActor } from '@/services/audit.service'
import type {
  Activity,
  ActivityInput,
  ActivitySubmission,
  ActivitySubmissionInput,
  AdminSubjectInput,
  AdminSubjectListItem,
  Announcement,
  Material,
  MaterialInput,
  ProfessorSubjectListItem,
  StudentSubjectListItem,
  SubjectDetail,
} from '@/types/subject'

/**
 * Capa de acceso a datos para el módulo de Materias.
 *
 * Es el único archivo que conoce el origen de los datos.
 * Migrar a Google Sheets, API REST o PostgreSQL implica reemplazar el cuerpo
 * de estas funciones; la firma pública y los componentes no cambian.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getStudentSubjectsAsync(): Promise<StudentSubjectListItem[]> {
  await delay(NETWORK_DELAY_MS)
  return getStudentSubjects()
}

export async function getProfessorSubjectsAsync(): Promise<ProfessorSubjectListItem[]> {
  await delay(NETWORK_DELAY_MS)
  return getProfessorSubjects()
}

export async function getAdminSubjectsAsync(): Promise<AdminSubjectListItem[]> {
  await delay(NETWORK_DELAY_MS)
  return getAdminSubjects()
}

export async function getSubjectDetailAsync(
  subjectId: string,
  role: 'alumno' | 'profesor' | 'administrador',
): Promise<SubjectDetail | null> {
  await delay(NETWORK_DELAY_MS)
  return getSubjectDetail(subjectId, role)
}

export async function getActivityAsync(subjectId: string, activityId: string): Promise<Activity | null> {
  await delay(NETWORK_DELAY_MS)
  return getActivity(subjectId, activityId)
}

export async function createActivityAsync(
  subjectId: string,
  input: ActivityInput,
  createdByName: string,
): Promise<Activity> {
  await delay(NETWORK_DELAY_MS)
  const activity = createActivity(subjectId, input)
  emitAppEvent('ACTIVITY_CREATED', {
    subjectId,
    subjectName: getSubjectDetail(subjectId, 'profesor')?.summary.name ?? '',
    itemId: activity.id,
    itemTitle: activity.title,
    createdByName,
  })
  return activity
}

export async function updateActivityAsync(
  subjectId: string,
  activityId: string,
  input: ActivityInput,
): Promise<Activity | null> {
  await delay(NETWORK_DELAY_MS)
  return updateActivity(subjectId, activityId, input)
}

export async function deleteActivityAsync(subjectId: string, activityId: string): Promise<boolean> {
  await delay(NETWORK_DELAY_MS)
  return deleteActivity(subjectId, activityId)
}

/** Duplica una actividad (Sprint 17, Parte 2): la copia se crea oculta para que el profesor la ajuste antes de publicarla. */
export async function duplicateActivityAsync(subjectId: string, activityId: string): Promise<Activity | null> {
  await delay(NETWORK_DELAY_MS)
  return duplicateActivity(subjectId, activityId)
}

/** Oculta/muestra una actividad para el alumno (Sprint 17, Parte 2). */
export async function setActivityHiddenAsync(subjectId: string, activityId: string, isHidden: boolean): Promise<Activity | null> {
  await delay(NETWORK_DELAY_MS)
  return setActivityHidden(subjectId, activityId, isHidden)
}

export async function createMaterialAsync(
  subjectId: string,
  input: MaterialInput,
  createdByName: string,
): Promise<Material> {
  await delay(NETWORK_DELAY_MS)
  const material = createMaterial(subjectId, input)
  emitAppEvent('MATERIAL_CREATED', {
    subjectId,
    subjectName: getSubjectDetail(subjectId, 'profesor')?.summary.name ?? '',
    itemId: material.id,
    itemTitle: material.title,
    createdByName,
  })
  return material
}

export async function deleteMaterialAsync(subjectId: string, materialId: string): Promise<boolean> {
  await delay(NETWORK_DELAY_MS)
  return deleteMaterial(subjectId, materialId)
}

/** Oculta/muestra un material para el alumno (Sprint 17, Parte 3). */
export async function setMaterialHiddenAsync(subjectId: string, materialId: string, isHidden: boolean): Promise<Material | null> {
  await delay(NETWORK_DELAY_MS)
  return setMaterialHidden(subjectId, materialId, isHidden)
}

export async function createSubjectAnnouncementAsync(
  subjectId: string,
  content: string,
  author: string,
): Promise<Announcement> {
  await delay(NETWORK_DELAY_MS)
  return createSubjectAnnouncement(subjectId, content, author)
}

// ── Materias (CRUD del administrador, Sprint 13, Parte 3) ────────────

export async function createAdminSubjectAsync(actor: AuditActor, input: AdminSubjectInput): Promise<AdminSubjectListItem> {
  await delay(NETWORK_DELAY_MS)
  const careerName = findCareer(input.careerId)?.name ?? ''
  const subject = createAdminSubject(input, careerName)
  recordAudit(actor, 'Materias', `Creó la materia "${subject.name}"`, undefined, subject)
  return subject
}

export async function updateAdminSubjectAsync(
  actor: AuditActor,
  subjectId: string,
  input: AdminSubjectInput,
): Promise<AdminSubjectListItem | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findAdminSubject(subjectId)
  const careerName = findCareer(input.careerId)?.name ?? ''
  const subject = updateAdminSubject(subjectId, input, careerName)
  if (subject) recordAudit(actor, 'Materias', `Editó la materia "${subject.name}"`, before, subject)
  return subject
}

export async function assignSubjectProfessorAsync(
  actor: AuditActor,
  subjectId: string,
  professorId: string,
  professorName: string,
): Promise<AdminSubjectListItem | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findAdminSubject(subjectId)
  const subject = assignAdminSubjectProfessor(subjectId, professorId, professorName)
  if (subject) {
    recordAudit(actor, 'Materias', `Asignó a ${professorName} como profesor de "${subject.name}"`, before, subject)
  }
  return subject
}

export async function setSubjectActiveAsync(
  actor: AuditActor,
  subjectId: string,
  isActive: boolean,
): Promise<AdminSubjectListItem | null> {
  await delay(NETWORK_DELAY_MS)
  const before = findAdminSubject(subjectId)
  const subject = setAdminSubjectActive(subjectId, isActive)
  if (subject) {
    recordAudit(actor, 'Materias', isActive ? `Activó la materia "${subject.name}"` : `Desactivó la materia "${subject.name}"`, before, subject)
  }
  return subject
}

export async function deleteAdminSubjectAsync(actor: AuditActor, subjectId: string): Promise<boolean> {
  await delay(NETWORK_DELAY_MS)
  const before = findAdminSubject(subjectId)
  const removed = deleteAdminSubject(subjectId)
  if (removed && before) recordAudit(actor, 'Materias', `Eliminó la materia "${before.name}"`, before, undefined)
  return removed
}

// ── Entregas de actividades del alumno (Sprint 16, Parte 1) ──────────

export async function getActivitySubmissionAsync(activityId: string, studentId: string): Promise<ActivitySubmission | null> {
  await delay(NETWORK_DELAY_MS)
  return getActivitySubmission(activityId, studentId)
}

/** Entrega o reemplaza (antes del cierre) la entrega de una actividad. Emite `ACTIVITY_SUBMITTED`. */
export async function submitActivityAsync(
  subjectId: string,
  activityId: string,
  student: { id: string; name: string },
  input: ActivitySubmissionInput,
): Promise<ActivitySubmission> {
  await delay(NETWORK_DELAY_MS)
  const activity = getActivity(subjectId, activityId)
  const isLate = activity ? new Date() > new Date(activity.dueDate) : false
  const submission = upsertActivitySubmission(activityId, subjectId, student.id, input, isLate)

  emitAppEvent('ACTIVITY_SUBMITTED', {
    activityId,
    activityTitle: activity?.title ?? '',
    subjectId,
    subjectName: getSubjectDetail(subjectId, 'alumno')?.summary.name ?? '',
    studentId: student.id,
    studentName: student.name,
    isLate,
  })

  return submission
}
