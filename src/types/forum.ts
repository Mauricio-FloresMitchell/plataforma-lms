import type { Role } from '@/types/auth'

/**
 * Tipos de dominio del módulo de Foro Académico (PRD §12.6).
 */

export interface ForumCategory {
  id: string
  name: string
}

/**
 * Adjuntos del Foro (Sprint 16, Parte 3). Tipo propio en vez de reutilizar
 * `AttachmentKind` (`types/chat.ts`): el Foro admite 'video' y 'enlace',
 * que Chat no maneja, y extender el enum de Chat obligaría a tocar su
 * mapeo interno a `MessageType`/eventos — fuera de alcance de este sprint.
 */
export type ForumAttachmentKind = 'imagen' | 'pdf' | 'word' | 'excel' | 'powerpoint' | 'zip' | 'video' | 'enlace'

export interface ForumAttachment {
  id: string
  fileName: string
  kind: ForumAttachmentKind
  /** Simulado (mock) para archivos subidos; URL real solo cuando `kind === 'enlace'`. */
  url: string
}

export interface ForumAuthor {
  id: string
  name: string
  role: Role
  initials: string
  /** Carrera del autor (solo Alumno) — permite identificar a quién de otra disciplina consultar (PRD M2, paso 5). */
  career?: string
}

/** Reacción fija disponible en comentarios y respuestas (Sprint 13.1). */
export type ForumReactionEmoji = '👍' | '❤️' | '💡'

export const FORUM_REACTION_EMOJIS: ForumReactionEmoji[] = ['👍', '❤️', '💡']

/** Resumen de una reacción ya calculado para la UI: cuántos y si el usuario en sesión ya reaccionó. */
export interface ForumReactionSummary {
  emoji: ForumReactionEmoji
  count: number
  reactedByMe: boolean
}

/**
 * Campos comunes a comentario y respuesta destacables (Sprint 13.1).
 * `isFeatured` lo marcan Profesor o Administrador. Al marcarlo se prepara un
 * evento para integrar el Leaderboard (+15 pts) en un sprint futuro — ver
 * `FeaturedAnswerEvent`; esta plataforma NO aplica puntos todavía.
 */
interface Featurable {
  isFeatured: boolean
  featuredByName?: string
  featuredAt?: string
}

/**
 * Campos comunes de moderación (Sprint 13.2): borrado suave (nunca se
 * elimina el registro, para poder "Restaurar contenido") con quién y cuándo.
 */
interface Moderatable {
  isDeleted: boolean
  deletedByName?: string
  deletedAt?: string
}

export interface ForumReply extends Featurable, Moderatable {
  id: string
  author: ForumAuthor
  content: string
  /** Fecha ISO 8601. */
  createdAt: string
  reactions: ForumReactionSummary[]
  /** Solo imágenes (Sprint 16, Parte 3: "los comentarios únicamente permitirán texto e imágenes"). */
  attachments?: ForumAttachment[]
}

export interface ForumComment extends Featurable, Moderatable {
  id: string
  author: ForumAuthor
  content: string
  createdAt: string
  replies: ForumReply[]
  reactions: ForumReactionSummary[]
  /** Solo imágenes (Sprint 16, Parte 3). */
  attachments?: ForumAttachment[]
}

export interface ForumPostSummary {
  id: string
  title: string
  excerpt: string
  categoryId: string
  categoryName: string
  tags: string[]
  author: ForumAuthor
  createdAt: string
  /** Comentarios + respuestas. */
  commentCount: number
  /** Profesor/Administrador: aparece primero en el listado (Sprint 13.2). */
  isPinned: boolean
  pinnedByName?: string
  /** Profesor/Administrador: bloquea comentarios nuevos (Sprint 13.2). */
  isClosed: boolean
  closedByName?: string
}

export interface ForumPost extends ForumPostSummary, Moderatable {
  content: string
  comments: ForumComment[]
  /** Imágenes, PDF, Word, Excel, PowerPoint, ZIP, video o enlace (Sprint 16, Parte 3). */
  attachments?: ForumAttachment[]
}

/** Datos que captura el usuario al crear una publicación. */
export interface CreateForumPostInput {
  title: string
  categoryId: string
  tags: string[]
  content: string
  attachments?: ForumAttachment[]
}

/**
 * Notificaciones internas del Foro (Sprint 13.1). Viven únicamente dentro del
 * módulo Foro (`/foro/notificaciones`), no hay un centro de notificaciones
 * global — no se tocó el Header ni la navegación compartida.
 */
export type ForumNotificationType =
  | 'reply_to_post'
  | 'reply_to_comment'
  | 'mention'
  | 'report_update'
  | 'warning_received'
  | 'content_removed'

export interface ForumNotification {
  id: string
  /** Id del `ForumAuthor` que debe ver esta notificación. */
  recipientId: string
  type: ForumNotificationType
  postId: string
  postTitle: string
  actorName: string
  /** Fragmento del comentario/respuesta que generó la notificación. */
  excerpt: string
  createdAt: string
  read: boolean
}

/**
 * Evento preparado para integrar el Leaderboard cuando el Profesor o el
 * Administrador marcan una respuesta como destacada (Sprint 13.1).
 * Solo se registra el evento — `pendingPoints` documenta la intención
 * (coincide con la acción "Respuesta foro" del catálogo de Gamificación,
 * +15 pts), pero ningún punto se aplica todavía.
 */
export interface FeaturedAnswerEvent {
  id: string
  postId: string
  targetId: string
  targetType: 'comment' | 'reply'
  authorId: string
  authorName: string
  markedByName: string
  markedByRole: Extract<Role, 'profesor' | 'administrador'>
  createdAt: string
  pendingPoints: 15
}

/**
 * Moderación del Foro (Sprint 13.2).
 *
 * Alcance del reporte: una publicación completa o un comentario/respuesta
 * puntual dentro de ella.
 */
export type ForumReportTargetType = 'post' | 'comment' | 'reply'

export const FORUM_REPORT_REASONS = [
  'spam',
  'lenguaje_ofensivo',
  'acoso',
  'contenido_inapropiado',
  'informacion_falsa',
  'plagio',
  'otro',
] as const

export type ForumReportReason = (typeof FORUM_REPORT_REASONS)[number]

export const FORUM_REPORT_REASON_LABELS: Record<ForumReportReason, string> = {
  spam: 'Spam',
  lenguaje_ofensivo: 'Lenguaje ofensivo',
  acoso: 'Acoso',
  contenido_inapropiado: 'Contenido inapropiado',
  informacion_falsa: 'Información falsa',
  plagio: 'Plagio',
  otro: 'Otro',
}

export type ForumReportStatus = 'pendiente' | 'resuelto' | 'ignorado'

/** Qué hizo el Administrador al resolver un reporte (queda también en `ModerationLogEntry`). */
export type ForumModerationAction =
  | 'ignorar'
  | 'resolver'
  | 'eliminar_publicacion'
  | 'eliminar_comentario'
  | 'advertencia'
  | 'restaurar'

export interface ForumReport {
  id: string
  targetType: ForumReportTargetType
  targetId: string
  postId: string
  postTitle: string
  /** Fragmento del contenido reportado, para revisarlo sin abrir la publicación. */
  contentExcerpt: string
  contentAuthorId: string
  contentAuthorName: string
  reason: ForumReportReason
  /** Obligatoria solo cuando `reason === 'otro'`. */
  description?: string
  reportedById: string
  reportedByName: string
  createdAt: string
  status: ForumReportStatus
  resolution?: ForumModerationAction
  resolvedByName?: string
  resolvedAt?: string
}

/** Datos que captura el Alumno/Profesor al reportar una publicación o comentario. */
export interface CreateForumReportInput {
  targetType: ForumReportTargetType
  targetId: string
  postId: string
  reason: ForumReportReason
  description?: string
}

/** Historial de moderación: toda acción del Administrador queda registrada aquí. */
export interface ModerationLogEntry {
  id: string
  action: ForumModerationAction
  targetType: ForumReportTargetType
  targetId: string
  postId: string
  postTitle: string
  targetAuthorId?: string
  targetAuthorName?: string
  performedByName: string
  note?: string
  relatedReportId?: string
  createdAt: string
  /** Solo para acciones de eliminación: si ya se restauró desde el historial. */
  restoredAt?: string
}

/** Advertencia enviada por el Administrador a un usuario. Queda en su historial permanentemente. */
export interface UserWarning {
  id: string
  userId: string
  userName: string
  message: string
  issuedByName: string
  createdAt: string
  relatedReportId?: string
}

/**
 * Estado de moderación agregado de un usuario (Sprint 13.2). El sprint
 * explícitamente NO implementa suspensiones/bloqueos — `isSuspended` y
 * `suspendedUntil` son la forma preparada para una versión futura y siempre
 * valen `false`/`undefined` en este MVP; ninguna pantalla los aplica todavía.
 */
export interface UserModerationStatus {
  userId: string
  userName: string
  role: Role
  warningsCount: number
  lastWarningAt?: string
  isSuspended: boolean
  suspendedUntil?: string
}
