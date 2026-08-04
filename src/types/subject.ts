import type { Badge } from './evaluation'

/**
 * Tipos de dominio para el módulo de Materias.
 */

/**
 * Adjunto simulado (mock): solo se guarda el nombre, no hay carga real de
 * archivos. Kinds ampliados en Sprint 17 (Parte 2): además de archivo/imagen
 * genéricos, actividades y materiales admiten audio, video y enlaces.
 */
export interface MockAttachment {
  id: string
  name: string
  kind: 'archivo' | 'imagen' | 'audio' | 'video' | 'enlace'
}

/** Criterio de la rúbrica asociada a una actividad (Sprint 16, Parte 1). */
export interface RubricCriterion {
  id: string
  label: string
  description: string
  /** Puntos que aporta este criterio dentro del 100% de la actividad. */
  weight: number
}

export interface Activity {
  id: string
  title: string
  description: string
  /** Instrucciones completas de entrega (Sprint 16, Parte 1). Opcional por compatibilidad con actividades previas. */
  instructions?: string
  /** Fecha de apertura (Sprint 17, Parte 2): antes de esta fecha la actividad no está disponible para el alumno. */
  openDate?: string
  dueDate: string
  status: 'pendiente' | 'completada' | 'atrasada'
  /** Archivos adjuntos del profesor (los mismos que ya adjuntaba al crear la actividad). */
  attachments?: MockAttachment[]
  /** Porcentaje de evaluación que representa dentro de la materia. */
  weightPercentage?: number
  rubric?: RubricCriterion[]
  /** Oculta la actividad para el alumno sin eliminarla (Sprint 17, Parte 2). */
  isHidden?: boolean
}

/** Estado de la entrega de un alumno para una actividad (Sprint 16, Parte 1). */
export type SubmissionStatus = 'no_entregado' | 'entregado' | 'evaluado'

/** Una versión entregada (permite armar el historial de entregas al reemplazar antes del cierre). */
export interface SubmissionVersion {
  files: MockAttachment[]
  comment?: string
  submittedAt: string
}

export interface ActivitySubmission {
  id: string
  activityId: string
  subjectId: string
  studentId: string
  files: MockAttachment[]
  comment?: string
  submittedAt: string
  isLate: boolean
  status: SubmissionStatus
  /** Entregas previas a la vigente, más reciente primero (Sprint 16, "historial de entregas"). */
  history: SubmissionVersion[]
  /** Retroalimentación del profesor, capturada al evaluar la entrega. */
  feedback?: string
  percentage?: number
  observations?: string
  badges?: Badge[]
  evaluatedAt?: string
  evaluatedByName?: string
}

/** Datos capturados por el alumno al entregar o reemplazar una entrega. */
export interface ActivitySubmissionInput {
  files: MockAttachment[]
  comment?: string
}

/** Datos capturados por el profesor al crear/editar una actividad. */
export interface ActivityInput {
  title: string
  description: string
  instructions?: string
  openDate?: string
  dueDate: string
  status: Activity['status']
  attachments: MockAttachment[]
  weightPercentage?: number
  rubric?: RubricCriterion[]
  isHidden?: boolean
}

export type MaterialType = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'imagen' | 'video' | 'enlace'

/** Categorías de recursos del profesor (Sprint 17, Parte 3). */
export const MATERIAL_CATEGORIES = ['Lectura', 'Video', 'Plantilla', 'Guía', 'Evaluación', 'Otro'] as const
export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number]

export interface Material {
  id: string
  title: string
  type: MaterialType
  url: string
  uploadedAt: string
  description?: string
  category?: MaterialCategory
  tags?: string[]
  /** Oculto para el alumno sin eliminarlo (Sprint 17, Parte 3). */
  isHidden?: boolean
  /** No visible para el alumno antes de esta fecha (Sprint 17, Parte 3). */
  scheduledAt?: string
}

/** Datos capturados por el profesor al crear un material. */
export interface MaterialInput {
  title: string
  type: MaterialType
  /** URL (enlace/video) o nombre del archivo adjunto simulado. */
  url: string
  description?: string
  category?: MaterialCategory
  tags?: string[]
  isHidden?: boolean
  scheduledAt?: string
}

export interface Announcement {
  id: string
  content: string
  author: string
  createdAt: string
}

export interface SubjectSummary {
  id: string
  name: string
  code: string
  credits: number
  description: string
}

export interface SubjectStudent {
  id: string
  name: string
  progress: number
  competencyLevel: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'
}

export interface SubjectDetail {
  summary: SubjectSummary
  teacher?: string
  students?: SubjectStudent[]
  activities: Activity[]
  materials: Material[]
  announcements: Announcement[]
  progress?: number
}

export interface StudentSubjectListItem {
  id: string
  name: string
  code: string
  teacher: string
  progress: number
}

export interface ProfessorSubjectListItem {
  id: string
  name: string
  code: string
  groupName: string
  studentsCount: number
}

export interface AdminSubjectListItem {
  id: string
  name: string
  code: string
  credits: number
  teachers: string[]
  /** Carrera a la que pertenece (Sprint 13, Parte 3). Ausente en materias sin carrera asignada. */
  careerId?: string
  careerName?: string
  /** Cuatrimestre (1-9). */
  term?: number
  /** Profesor titular asignado — distinto de `teachers` (histórico, admite varios). */
  professorId?: string
  professorName?: string
  isActive?: boolean
}

/** Datos capturados por el Administrador al crear/editar una materia (Sprint 13, Parte 3). */
export interface AdminSubjectInput {
  name: string
  code: string
  credits: number
  careerId: string
  term: number
}
