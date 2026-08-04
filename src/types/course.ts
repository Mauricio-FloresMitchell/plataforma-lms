/**
 * Tipos de dominio de Cursos Asignados y Certificaciones (Sprint 16, Parte 4).
 *
 * Catálogo independiente de Materias: son cursos complementarios (no
 * curriculares) asignados al alumno. Un curso `finalizado` alimenta
 * Certificaciones automáticamente — `getCertificatesAsync` los deriva en
 * vivo a partir de `AssignedCourse[]`, así que no existe un segundo store
 * que se pueda desincronizar.
 */

export type CourseStatus = 'activo' | 'finalizado'

export interface AssignedCourse {
  id: string
  title: string
  description: string
  category: string
  status: CourseStatus
  /** 0-100. */
  progress: number
  startDate: string
  dueDate: string
  /** Presente solo cuando `status === 'finalizado'`. */
  completedAt?: string
}

export type CertificateStatus = 'disponible' | 'en_proceso'

export interface Certificate {
  id: string
  courseId: string
  courseTitle: string
  category: string
  issuedAt: string
  status: CertificateStatus
}
