/**
 * Catálogo de eventos de la plataforma (Sprint Event Bus).
 *
 * Cada módulo (Evaluaciones, Reportes, Foro, Gamificación, Leaderboard,
 * Materias, Avisos, Autenticación) emite estos eventos desde su capa de
 * `services/*` cuando una acción se completa con éxito. Ningún módulo crea
 * notificaciones directamente: `NotificationListener` (`core/events/listeners`)
 * escucha este mismo mapa y decide qué notificación generar, si aplica.
 *
 * Algunos eventos (`GRADE_CREATED`, `GRADE_DELETED`, `BADGE_REVOKED`,
 * `NOTICE_CREATED`, `NOTICE_UPDATED`, `USER_REGISTERED`, `ADMIN_SUSPENSION`,
 * `PROFILE_UPDATED`) están definidos y tienen un listener preparado, pero
 * ningún flujo actual los emite todavía — el profesor nunca "crea" una
 * evaluación (todas están pre-provisionadas por alumno; `recordEvaluationAsync`
 * solo las actualiza, de ahí que solo exista `GRADE_UPDATED`), y tampoco existe
 * una pantalla de "eliminar calificación", "revocar insignia", editar un aviso
 * ya enviado, registro de usuarios, suspensiones (explícitamente fuera de
 * alcance) ni edición de perfil. Quedan listos para cuando esas
 * funcionalidades se construyan, sin tocar el Event Bus.
 *
 * Sprint 12 agrega los eventos de Chat (`MESSAGE_*`, `CONVERSATION_*`,
 * `*_SHARED`, `REACTION_*`), todos emitidos desde `chat.service.ts`.
 * `MESSAGE_READ` es el único que hoy no tiene listener que lo consuma: el
 * modelo ya lo soporta (`ConversationMember.lastReadAt`, que alimenta el
 * estado `leído` calculado en el cliente), pero ningún listener necesita
 * reaccionar a él todavía — queda listo para un futuro indicador "visto por".
 */

import type { ConversationType, MessageType, ReactionEmoji } from '@/types/chat'
import type { Role } from '@/types/auth'

export type AppEventName =
  | 'REPORT_SUBMITTED'
  | 'REPORT_APPROVED'
  | 'REPORT_REJECTED'
  | 'GRADE_CREATED'
  | 'GRADE_UPDATED'
  | 'GRADE_DELETED'
  | 'FORUM_POST_CREATED'
  | 'FORUM_COMMENT_CREATED'
  | 'FORUM_REPLY_CREATED'
  | 'FORUM_POST_REPORTED'
  | 'FORUM_COMMENT_REPORTED'
  | 'BADGE_GRANTED'
  | 'BADGE_REVOKED'
  | 'POINTS_GRANTED'
  | 'POINTS_REMOVED'
  | 'LEADERBOARD_UPDATED'
  | 'ACTIVITY_CREATED'
  | 'MATERIAL_CREATED'
  | 'NOTICE_CREATED'
  | 'NOTICE_UPDATED'
  | 'NOTICE_SENT'
  | 'USER_REGISTERED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'ADMIN_WARNING_SENT'
  | 'ADMIN_SUSPENSION'
  | 'PROFILE_UPDATED'
  | 'MESSAGE_SENT'
  | 'MESSAGE_EDITED'
  | 'MESSAGE_DELETED'
  | 'MESSAGE_READ'
  | 'CONVERSATION_CREATED'
  | 'CONVERSATION_ARCHIVED'
  | 'CONVERSATION_PINNED'
  | 'FILE_SHARED'
  | 'IMAGE_SHARED'
  | 'AUDIO_SHARED'
  | 'DOCUMENT_SHARED'
  | 'REACTION_ADDED'
  | 'REACTION_REMOVED'
  | 'ACTIVITY_SUBMITTED'
  | 'ACTIVITY_EVALUATED'
  | 'GROUP_REQUEST_CREATED'
  | 'GROUP_REQUEST_RESOLVED'
  | 'TITULACION_PHASE_SUBMITTED'
  | 'TITULACION_PHASE_REVIEWED'
  | 'COURSE_COMPLETED'
  | 'VOTE_CAST'

interface BaseEventPayload {
  /** Fecha ISO 8601 del evento. La rellena `EventBus`, no quien emite. */
  occurredAt: string
}

export interface ReportSubmittedPayload extends BaseEventPayload {
  reportId: string
  studentId: string
  studentName: string
  subjectId: string
  subjectName: string
  week: number
}

export interface ReportReviewedPayload extends BaseEventPayload {
  reportId: string
  studentId: string
  subjectName: string
  week: number
  observations: string
}

export interface GradePayload extends BaseEventPayload {
  evaluationId: string
  studentId: string
  subjectId: string
  subjectName: string
  status: 'borrador' | 'pendiente' | 'publicada'
}

export interface ForumPostPayload extends BaseEventPayload {
  postId: string
  postTitle: string
  actorId: string
  actorName: string
}

export interface ForumCommentPayload extends BaseEventPayload {
  postId: string
  postTitle: string
  commentId: string
  actorId: string
  actorName: string
  /** Autor de la publicación o del comentario padre — a quien se le notifica (si no es el mismo actor). */
  recipientId: string
}

export interface ForumReportedPayload extends BaseEventPayload {
  reportId: string
  postId: string
  postTitle: string
  targetType: 'post' | 'comment' | 'reply'
  reason: string
}

export interface BadgePayload extends BaseEventPayload {
  studentId: string
  studentName: string
  badgeId: string
  badgeName: string
  badgeIcon: string
}

export interface PointsPayload extends BaseEventPayload {
  studentId: string
  studentName: string
  subjectId: string
  points: number
  actionLabel: string
}

export interface LeaderboardUpdatedPayload extends BaseEventPayload {
  studentId: string
  studentName: string
  subjectId: string
  rank: number
  enteredTop3: boolean
}

export interface SubjectContentPayload extends BaseEventPayload {
  subjectId: string
  subjectName: string
  itemId: string
  itemTitle: string
  createdByName: string
}

export interface NoticeSentPayload extends BaseEventPayload {
  announcementId: string
  /**
   * `'todos' | 'carrera' | 'profesor' | 'rol'` se agregaron en el Sprint 13
   * (Parte 9, difusión del Administrador) — additivo, no cambia el manejo ya
   * existente de `'alumno' | 'grupo' | 'materia'` (avisos de materia, Sprint
   * Avisos del Profesor).
   */
  scope: 'alumno' | 'grupo' | 'materia' | 'todos' | 'carrera' | 'profesor' | 'rol'
  subjectName?: string
  targetName?: string
  /** Solo cuando `scope` es `'alumno'` o `'profesor'` con un destinatario puntual. */
  recipientId?: string
  /** Solo cuando `scope === 'rol'`. */
  role?: Role
  authorName: string
  content: string
}

export interface UserAuthPayload extends BaseEventPayload {
  userId: string
  userName: string
  role: 'alumno' | 'profesor' | 'administrador'
}

export interface AdminWarningPayload extends BaseEventPayload {
  userId: string
  userName: string
  message: string
  issuedByName: string
}

export interface ProfileUpdatedPayload extends BaseEventPayload {
  userId: string
  userName: string
}

export interface MessageSentPayload extends BaseEventPayload {
  messageId: string
  conversationId: string
  conversationTitle: string
  conversationType: ConversationType
  senderId: string
  senderName: string
  content: string
  messageType: MessageType
  /** Resto de los miembros de la conversación (Sprint 12): a quién notificar. */
  recipientIds: string[]
}

export interface MessageEditedPayload extends BaseEventPayload {
  messageId: string
  conversationId: string
  senderId: string
}

export interface MessageDeletedPayload extends BaseEventPayload {
  messageId: string
  conversationId: string
  senderId: string
}

export interface MessageReadPayload extends BaseEventPayload {
  conversationId: string
  userId: string
  lastReadMessageId: string
}

export interface ConversationCreatedPayload extends BaseEventPayload {
  conversationId: string
  conversationTitle: string
  conversationType: ConversationType
  createdBy: string
  createdByName: string
  participantIds: string[]
}

export interface ConversationArchivedPayload extends BaseEventPayload {
  conversationId: string
  conversationTitle: string
  actorId: string
  isArchived: boolean
}

export interface ConversationPinnedPayload extends BaseEventPayload {
  conversationId: string
  conversationTitle: string
  actorId: string
  isPinned: boolean
}

export interface FileSharedPayload extends BaseEventPayload {
  attachmentId: string
  messageId: string
  conversationId: string
  conversationTitle: string
  fileName: string
  mimeType: string
  sharedBy: string
  sharedByName: string
  recipientIds: string[]
}

export interface ReactionPayload extends BaseEventPayload {
  messageId: string
  conversationId: string
  userId: string
  userName: string
  emoji: ReactionEmoji
  /** Autor del mensaje reaccionado — a quien se le notifica. */
  messageSenderId: string
}

/** Entrega de una actividad (Sprint 16, Parte 1). */
export interface ActivitySubmittedPayload extends BaseEventPayload {
  activityId: string
  activityTitle: string
  subjectId: string
  subjectName: string
  studentId: string
  studentName: string
  isLate: boolean
}

/** Evaluación de una entrega (Sprint 16, Parte 1). */
export interface ActivityEvaluatedPayload extends BaseEventPayload {
  activityId: string
  activityTitle: string
  subjectId: string
  subjectName: string
  studentId: string
  percentage: number
}

/** Solicitud de grupo de conversación del alumno al profesor (Sprint 16, Parte 2). */
export interface GroupConversationRequestPayload extends BaseEventPayload {
  requestId: string
  subjectId: string
  subjectName: string
  studentId: string
  studentName: string
  professorId: string
  reason: string
}

export interface GroupConversationResolvedPayload extends BaseEventPayload {
  requestId: string
  studentId: string
  subjectName: string
  status: 'aceptada' | 'rechazada'
  conversationId?: string
}

/** Fase de Producto de Titulación enviada por el alumno (Sprint 17, Parte 11). */
export interface TitulacionPhaseSubmittedPayload extends BaseEventPayload {
  studentId: string
  studentName: string
  phaseId: string
  phaseName: string
}

/** Fase revisada (aprobada/rechazada) por el profesor. */
export interface TitulacionPhaseReviewedPayload extends BaseEventPayload {
  studentId: string
  studentName: string
  phaseId: string
  phaseName: string
  action: 'aprobada' | 'rechazada'
  reviewedByName: string
}

/** Curso complementario marcado como finalizado (Sprint 18, Parte 7 — alimenta Titulación). */
export interface CourseCompletedPayload extends BaseEventPayload {
  courseId: string
  courseTitle: string
  studentId: string
}

/** Un alumno vota por un compañero en el Leaderboard (Sprint Leaderboard, votación entre alumnos). */
export interface VoteCastPayload extends BaseEventPayload {
  voteId: string
  subjectId: string
  subjectName: string
  voterId: string
  voterName: string
  candidateId: string
  candidateName: string
  reason?: string
}

/** Mapa evento → forma del payload. `EventBus` se tipa a partir de esta interfaz. */
export interface AppEventMap {
  REPORT_SUBMITTED: ReportSubmittedPayload
  REPORT_APPROVED: ReportReviewedPayload
  REPORT_REJECTED: ReportReviewedPayload
  GRADE_CREATED: GradePayload
  GRADE_UPDATED: GradePayload
  GRADE_DELETED: GradePayload
  FORUM_POST_CREATED: ForumPostPayload
  FORUM_COMMENT_CREATED: ForumCommentPayload
  FORUM_REPLY_CREATED: ForumCommentPayload
  FORUM_POST_REPORTED: ForumReportedPayload
  FORUM_COMMENT_REPORTED: ForumReportedPayload
  BADGE_GRANTED: BadgePayload
  BADGE_REVOKED: BadgePayload
  POINTS_GRANTED: PointsPayload
  POINTS_REMOVED: PointsPayload
  LEADERBOARD_UPDATED: LeaderboardUpdatedPayload
  ACTIVITY_CREATED: SubjectContentPayload
  MATERIAL_CREATED: SubjectContentPayload
  NOTICE_CREATED: NoticeSentPayload
  NOTICE_UPDATED: NoticeSentPayload
  NOTICE_SENT: NoticeSentPayload
  USER_REGISTERED: UserAuthPayload
  USER_LOGIN: UserAuthPayload
  USER_LOGOUT: UserAuthPayload
  ADMIN_WARNING_SENT: AdminWarningPayload
  ADMIN_SUSPENSION: AdminWarningPayload
  PROFILE_UPDATED: ProfileUpdatedPayload
  MESSAGE_SENT: MessageSentPayload
  MESSAGE_EDITED: MessageEditedPayload
  MESSAGE_DELETED: MessageDeletedPayload
  MESSAGE_READ: MessageReadPayload
  CONVERSATION_CREATED: ConversationCreatedPayload
  CONVERSATION_ARCHIVED: ConversationArchivedPayload
  CONVERSATION_PINNED: ConversationPinnedPayload
  FILE_SHARED: FileSharedPayload
  IMAGE_SHARED: FileSharedPayload
  AUDIO_SHARED: FileSharedPayload
  DOCUMENT_SHARED: FileSharedPayload
  REACTION_ADDED: ReactionPayload
  REACTION_REMOVED: ReactionPayload
  ACTIVITY_SUBMITTED: ActivitySubmittedPayload
  ACTIVITY_EVALUATED: ActivityEvaluatedPayload
  GROUP_REQUEST_CREATED: GroupConversationRequestPayload
  GROUP_REQUEST_RESOLVED: GroupConversationResolvedPayload
  TITULACION_PHASE_SUBMITTED: TitulacionPhaseSubmittedPayload
  TITULACION_PHASE_REVIEWED: TitulacionPhaseReviewedPayload
  COURSE_COMPLETED: CourseCompletedPayload
  VOTE_CAST: VoteCastPayload
}
