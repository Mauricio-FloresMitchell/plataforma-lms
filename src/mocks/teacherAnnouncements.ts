import type { TeacherAnnouncement, TeacherAnnouncementInput } from '@/types/announcement'

/**
 * Historial simulado de avisos enviados por el profesor.
 * Estado en memoria durante la sesión.
 */
let TEACHER_ANNOUNCEMENTS: TeacherAnnouncement[] = [
  {
    id: 'tann-001',
    subjectId: 'sub-001',
    subjectName: 'Clase Modelo 1 y Modelo 2',
    scope: 'materia',
    content: 'Se adelanta la fecha del examen parcial al 15 de agosto.',
    attachments: [],
    createdAt: '2026-07-23T10:00:00.000Z',
  },
  {
    id: 'tann-002',
    subjectId: 'sub-001',
    subjectName: 'Clase Modelo 1 y Modelo 2',
    scope: 'alumno',
    targetName: 'Patricia Delgado Garcia',
    content: 'Recuerda entregar tu reporte pendiente de la semana 10.',
    attachments: [],
    createdAt: '2026-07-24T12:00:00.000Z',
  },
]

export function getTeacherAnnouncements(): TeacherAnnouncement[] {
  return TEACHER_ANNOUNCEMENTS
}

export function createTeacherAnnouncement(input: TeacherAnnouncementInput): TeacherAnnouncement {
  const announcement: TeacherAnnouncement = {
    id: `tann-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...input,
  }
  TEACHER_ANNOUNCEMENTS = [announcement, ...TEACHER_ANNOUNCEMENTS]
  return announcement
}
