/**
 * Producto de Titulación — núcleo del modelo académico (Sprint 18).
 *
 * Historial del módulo:
 * - Sprint 16, Parte 5: placeholder estructurado de solo lectura.
 * - Sprint 17, Parte 11: primera versión funcional (borrador/envío/revisión
 *   de fases) cross-role.
 * - Sprint 18: modelo de datos completo (versionado, archivos tipados,
 *   retroalimentación por fase, historial de auditoría, sincronización
 *   automática desde otros módulos) y capa de repositorio/adaptador para
 *   quedar desacoplado de un backend real (ver `@/repositories/titulacion`).
 *
 * Cada alumno posee un único `TitulacionProduct`. Nunca se sobrescribe
 * información: cada modificación relevante incrementa `version` y agrega una
 * entrada a `versions`/`history`.
 */

export type TitulacionProductStatus = 'borrador' | 'activo' | 'en_revision' | 'cerrado'
export type TitulacionPhaseStatus = 'pendiente' | 'en_proceso' | 'enviada' | 'aprobada' | 'rechazada' | 'bloqueada'
export type TitulacionDeliverableStatus = 'pendiente' | 'en_proceso' | 'enviado' | 'aprobado' | 'rechazado'

/** Tipos de archivo admitidos (Sprint 18, Parte 10). */
export type TitulacionFileKind = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'zip' | 'imagen' | 'video' | 'audio' | 'enlace'

export interface TitulacionFile {
  id: string
  name: string
  kind: TitulacionFileKind
  /** Versión del archivo — cada reemplazo agrega uno nuevo, nunca sustituye al anterior. */
  version: number
  uploadedById: string
  uploadedByName: string
  uploadedAt: string
  /** Simulado (mock): no hay carga real de archivos en el MVP. */
  url: string
}

/** Referencia a evidencia generada automáticamente en otro módulo (Sprint 17/18, "sincronización automática"). */
export type TitulacionEvidenceKind = 'reporte' | 'evaluacion' | 'actividad' | 'badge' | 'leaderboard' | 'curso' | 'certificacion'

export interface TitulacionEvidenceRef {
  id: string
  kind: TitulacionEvidenceKind
  label: string
  /** Ruta interna para abrir el origen. */
  link?: string
  syncedAt: string
}

export interface TitulacionDeliverable {
  id: string
  title: string
  status: TitulacionDeliverableStatus
  dueDate?: string
  draftContent?: string
  files: TitulacionFile[]
  evidence: TitulacionEvidenceRef[]
  submittedAt?: string
}

/** Retroalimentación del profesor asociada a una fase (Sprint 18, Parte 6). */
export type TitulacionFeedbackType = 'comentario' | 'aprobacion' | 'rechazo' | 'solicitud_cambios' | 'observacion'

export interface TitulacionFeedbackEntry {
  id: string
  type: TitulacionFeedbackType
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

/** Snapshot de una versión de fase — nunca se sobrescribe, solo se agregan (Sprint 18, Parte 4). */
export interface TitulacionVersionSnapshot {
  version: number
  authorId: string
  authorName: string
  createdAt: string
  comment: string
  changesSummary: string
}

export interface TitulacionPhase {
  id: string
  title: string
  description: string
  objectives: string[]
  deliverables: TitulacionDeliverable[]
  feedback: TitulacionFeedbackEntry[]
  status: TitulacionPhaseStatus
  date: string
  version: number
  versions: TitulacionVersionSnapshot[]
}

/**
 * Historial global del producto (Sprint 18, Parte 11): quién, qué, cuándo,
 * desde dónde. `source` documenta el origen simulado (rol + "Web", ya que el
 * MVP no tiene IP/dispositivo reales fuera del sistema de auditoría general
 * — ver `services/audit.service.ts`).
 */
export type TitulacionHistoryAction =
  | 'creo'
  | 'modifico'
  | 'comento'
  | 'aprobo'
  | 'rechazo'
  | 'descargo'
  | 'publico'
  | 'subio_archivo'
  | 'sincronizo'
  | 'reasigno_profesor'
  | 'desbloqueo_fase'
  | 'edito_estado'
  | 'cerro_producto'
  | 'exporto'

export interface TitulacionHistoryEntry {
  id: string
  actorId: string
  actorName: string
  action: TitulacionHistoryAction
  detail?: string
  source: string
  phaseId?: string
  createdAt: string
}

export interface TitulacionProduct {
  id: string
  studentId: string
  studentName: string
  /** Información general (Sprint 18, Parte 2). */
  objective: string
  status: TitulacionProductStatus
  careerId?: string
  careerName?: string
  subjectId?: string
  subjectName?: string
  professorId?: string
  professorName?: string
  version: number
  createdAt: string
  updatedAt: string
  /** Avance automático (Sprint 18, Parte 8) — siempre recalculado, nunca capturado a mano. */
  progressPercentage: number
  completedDeliverables: number
  pendingDeliverables: number
  /** Competencias alcanzadas, derivadas de evidencia sincronizada (evaluaciones/badges). */
  competencies: string[]
  phases: TitulacionPhase[]
  history: TitulacionHistoryEntry[]
  /** Observaciones generales del profesor (distintas de la retroalimentación por fase). */
  observations: string
}
