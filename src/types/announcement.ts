import type { MockAttachment } from '@/types/subject'

/**
 * Tipos de dominio para el módulo de Avisos del Profesor.
 * Distinto de `Announcement` (types/subject.ts), que es el aviso ya
 * publicado y visible dentro de la materia. `TeacherAnnouncement` es el
 * registro de historial del profesor, con el destinatario elegido.
 */
export type AnnouncementScope = 'alumno' | 'grupo' | 'materia'

export interface TeacherAnnouncement {
  id: string
  subjectId: string
  subjectName: string
  scope: AnnouncementScope
  /** Nombre del alumno o del grupo cuando el alcance no es "materia". */
  targetName?: string
  content: string
  attachments: MockAttachment[]
  createdAt: string
}

export interface TeacherAnnouncementInput {
  subjectId: string
  subjectName: string
  scope: AnnouncementScope
  targetName?: string
  content: string
  attachments: MockAttachment[]
}
