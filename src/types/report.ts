import type { TemplateId, WeekNumber } from '@/types/reportTemplate'

/**
 * Tipos de dominio del módulo de Reportes Semanales (PRD §12.4).
 * Ampliado en el Sprint 12 con el motor de plantillas académicas
 * (`@/types/reportTemplate`): los reportes creados a partir de una plantilla
 * agregan `templateId`, `answers`, `fieldValues`, `titulacionIntegration`,
 * `links` y `anonymizationConfirmed`. Los reportes anteriores al Sprint 12
 * (datos semilla) no tienen esos campos — son opcionales a propósito para
 * no romper el historial existente.
 */

export type ReportStatus = 'pendiente' | 'aprobado' | 'correcciones'

/** Escala de la Evaluación Docente de Reportes (Sprint 12, ADR-008). Ver `@/utils/reportGrade`. */
export type ReportGradeLevel = 'A' | 'B' | 'C' | 'D' | 'F'

export type ReportFileKind = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'jpg' | 'png' | 'zip'
export type ReportLinkPlatform = 'github' | 'google_drive' | 'canva' | 'figma' | 'youtube'

/** Metadatos de evidencia. En el MVP no hay carga real de archivos. */
export interface ReportEvidence {
  id: string
  name: string
  /** Tipo de archivo simulado. Ausente en evidencias sembradas antes del Sprint 12. */
  fileKind?: ReportFileKind
}

/** Enlace externo adjunto (GitHub, Google Drive, Canva, Figma, YouTube). */
export interface ReportLink {
  id: string
  platform: ReportLinkPlatform
  url: string
}

/** Respuesta a una pregunta dinámica de la semana capturada. */
export interface ReportAnswer {
  questionId: string
  value: string
}

/** Valor de un campo específico de la plantilla. */
export interface ReportFieldValue {
  fieldId: string
  value: string
}

export interface ReportEvaluation {
  level: ReportGradeLevel
  observations: string
  /** Fecha ISO 8601. */
  evaluatedAt: string
  /** Rúbrica A (70% del porcentaje final). Ausente en evaluaciones previas al Sprint 12. */
  rubricA?: number
  /** Rúbrica B (30% del porcentaje final). */
  rubricB?: number
  /** Puntos de bonificación sumados al porcentaje ponderado. */
  bonus?: number
  /** Porcentaje final ya calculado (rubricA*0.7 + rubricB*0.3 + bonus). `level` se deriva de este valor. */
  finalPercentage?: number
  /** Insignias otorgadas junto con esta evaluación. */
  badgeIds?: string[]
}

export interface WeeklyReport {
  id: string
  studentId: string
  studentName: string
  subjectId: string
  subjectName: string
  groupName: string
  week: number
  title: string
  content: string
  status: ReportStatus
  /** Fecha ISO 8601 de envío. */
  submittedAt: string
  evidences: ReportEvidence[]
  evaluation: ReportEvaluation | null
  /** Plantilla académica usada (Sprint 12). Ausente en reportes previos al motor de plantillas. */
  templateId?: TemplateId
  fieldValues?: ReportFieldValue[]
  answers?: ReportAnswer[]
  /** Sección 4 (obligatoria): cómo este avance se integra al producto de titulación. */
  titulacionIntegration?: string
  /** Regla especial Derecho/Psicología: confirmación de que no se incluyeron datos identificables. */
  anonymizationConfirmed?: boolean
  links?: ReportLink[]
}

/** Datos que captura el alumno al crear un reporte con el motor de plantillas. */
export interface CreateReportInput {
  subjectId: string
  templateId: TemplateId
  week: WeekNumber
  fieldValues: ReportFieldValue[]
  answers: ReportAnswer[]
  titulacionIntegration: string
  anonymizationConfirmed?: boolean
  evidences: ReportEvidence[]
  links: ReportLink[]
}

/** Decisión del profesor al revisar un reporte. */
export type ReviewDecision = 'aprobado' | 'correcciones'

/** Datos que captura el profesor en el bloque "Evaluación Docente" (Sprint 12). */
export interface EvaluateReportInput {
  rubricA: number
  rubricB: number
  bonus: number
  badgeIds: string[]
  observations: string
  decision: ReviewDecision
}

/** Reporte enriquecido con carrera/profesor para el Centro de Reportes del Administrador (Sprint 13, Parte 6). */
export interface AdminReportView extends WeeklyReport {
  careerName?: string
  professorName?: string
}

export interface AdminReportFilters {
  careerName?: string
  subjectId?: string
  professorName?: string
  studentId?: string
  week?: number
  status?: ReportStatus
}
