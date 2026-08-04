import { createTeacherAnnouncement, getTeacherAnnouncements } from '@/mocks/teacherAnnouncements'
import { emitAppEvent } from '@/core/events/EventBus'
import type { TeacherAnnouncement, TeacherAnnouncementInput } from '@/types/announcement'
import { createSubjectAnnouncementAsync } from './subject.service'

/**
 * Capa de acceso a datos del módulo de Avisos del Profesor.
 * Único archivo que conoce el origen de los datos.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getTeacherAnnouncementsAsync(): Promise<TeacherAnnouncement[]> {
  await delay(NETWORK_DELAY_MS)
  return getTeacherAnnouncements()
}

/**
 * Crea un aviso en el historial del profesor. Si el alcance es "materia",
 * también lo publica en la sección Avisos de esa materia (visible para el
 * alumno), reutilizando `createSubjectAnnouncementAsync`.
 */
export async function createTeacherAnnouncementAsync(
  input: TeacherAnnouncementInput,
  authorName: string,
): Promise<TeacherAnnouncement> {
  await delay(NETWORK_DELAY_MS)
  const created = createTeacherAnnouncement(input)

  if (input.scope === 'materia') {
    await createSubjectAnnouncementAsync(input.subjectId, input.content, authorName)
  }

  emitAppEvent('NOTICE_SENT', {
    announcementId: created.id,
    scope: input.scope,
    subjectName: input.subjectName,
    targetName: input.targetName,
    authorName,
    content: input.content,
  })

  return created
}
