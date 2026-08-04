import type { Role } from '@/types/auth'

/**
 * Modelo del Centro de Comunicación Institucional (Sprint 12).
 *
 * Mensajería académica (no social): las conversaciones siempre están
 * autorizadas por rol (`chat.service.ts` valida antes de crear cualquier
 * conversación o mensaje) y, cuando aplica, ancladas a un elemento de la
 * plataforma (`contextType`/`contextId`) para no perder el hilo entre, por
 * ejemplo, un reporte y la aclaración que se discutió sobre él.
 */

export type ConversationType = 'individual' | 'grupal' | 'materia' | 'grupo' | 'institucional'

export const CONVERSATION_TYPE_LABELS: Record<ConversationType, string> = {
  individual: 'Individual',
  grupal: 'Grupo',
  materia: 'Materia',
  grupo: 'Grupo académico',
  institucional: 'Institucional',
}

/** Elemento de la plataforma al que puede anclarse una conversación (mejora "conversaciones con contexto"). */
export type ChatContextType = 'evaluacion' | 'reporte' | 'actividad' | 'foro'

export const CHAT_CONTEXT_LABELS: Record<ChatContextType, string> = {
  evaluacion: 'Evaluación',
  reporte: 'Reporte',
  actividad: 'Actividad',
  foro: 'Foro',
}

export interface Conversation {
  id: string
  type: ConversationType
  title: string
  createdBy: string
  createdAt: string
  updatedAt: string
  isArchived: boolean
  isPinned: boolean
  isMuted: boolean
  isClosed: boolean
  /** Borrado suave (Administrador, `DELETE /conversations/:id`) — nunca se elimina el registro. */
  isDeleted: boolean
  /** Elemento de origen (mejora "conversaciones con contexto"), ausente en conversaciones libres. */
  contextType?: ChatContextType
  contextId?: string
  /** Etiqueta legible del contexto (ej. "Reporte semana 3"), evita recalcularla en cada render. */
  contextLabel?: string
}

export type ConversationMemberRole = 'admin' | 'miembro'

export interface ConversationMember {
  conversationId: string
  userId: string
  /** Denormalizado (mismo criterio que `ForumAuthor`): evita resolver el directorio en cada render. */
  userName: string
  userRole: Role
  role: ConversationMemberRole
  joinedAt: string
  lastReadAt?: string
}

export type MessageType =
  | 'texto'
  | 'imagen'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'zip'
  | 'audio'
  | 'enlace'

/**
 * Estado de un mensaje, calculado (no almacenado): `enviado` al crearse,
 * `entregado` una vez persistido, `leido` cuando todos los demás miembros de
 * la conversación tienen `lastReadAt >= message.createdAt`. Ver
 * `getMessageStatus` en `mocks/chat.ts`.
 */
export type MessageStatus = 'enviado' | 'entregado' | 'leido'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: Role
  content: string
  type: MessageType
  /** Id del mensaje al que responde (Parte 3, "Responder mensaje"). */
  replyToId?: string
  edited: boolean
  editedAt?: string
  deleted: boolean
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export type AttachmentKind = 'imagen' | 'pdf' | 'word' | 'excel' | 'powerpoint' | 'zip' | 'audio' | 'otro'

export interface Attachment {
  id: string
  messageId: string
  conversationId: string
  fileName: string
  mimeType: string
  /** Bytes. Simulado — no hay carga real de archivos en el MVP. */
  size: number
  url: string
  kind: AttachmentKind
  uploadedBy: string
  uploadedByName: string
  createdAt: string
}

export type ReactionEmoji = '👍' | '❤️' | '👏' | '🎉'

export const REACTION_EMOJIS: ReactionEmoji[] = ['👍', '❤️', '👏', '🎉']

export interface Reaction {
  id: string
  messageId: string
  userId: string
  userName: string
  emoji: ReactionEmoji
}

/** Mensaje enriquecido para la UI: adjuntos/reacciones resueltos y estado calculado. */
export interface MessageWithDetails extends Message {
  status: MessageStatus
  attachments: Attachment[]
  reactions: Reaction[]
  replyTo?: Message | null
}

/** Conversación enriquecida para la lista (Parte 5): último mensaje y contador de no leídos ya resueltos. */
export interface ConversationSummary extends Conversation {
  members: ConversationMember[]
  lastMessage: Message | null
  unreadCount: number
}

export type ConversationFilter = 'todas' | 'no_leidas' | 'favoritas' | 'archivadas'

/** Datos para iniciar una conversación nueva (Parte 2/14). */
export interface CreateConversationInput {
  type: ConversationType
  title: string
  participantIds: string[]
  contextType?: ChatContextType
  contextId?: string
  contextLabel?: string
  /** Primer mensaje opcional (ej. botones "Solicitar aclaración" que abren el chat con texto precargado). */
  firstMessage?: string
}

export interface SendMessageInput {
  conversationId: string
  content: string
  type?: MessageType
  replyToId?: string
}

/** Ficha de contacto disponible para iniciar conversación (Parte 1, resuelta por rol en `chat.service.ts`). */
export interface ChatContact {
  id: string
  name: string
  role: Role
  /** Contexto legible (ej. nombre de la materia) cuando aplica. */
  subtitle?: string
}

/**
 * Solicitud de grupo de conversación (Sprint 16, Parte 2): el alumno no
 * puede crear conversaciones grupales directamente (`createConversationAsync`
 * lo bloquea), así que para hablar con compañeros solicita un grupo al
 * profesor de la materia, quien lo acepta (eligiendo a los alumnos de su
 * roster y creando la conversación grupal — queda como moderador por ser
 * quien la crea, ver `insertConversation`) o lo rechaza.
 */
export type GroupConversationRequestStatus = 'pendiente' | 'aceptada' | 'rechazada'

export interface GroupConversationRequest {
  id: string
  subjectId: string
  subjectName: string
  studentId: string
  studentName: string
  professorId: string
  reason: string
  status: GroupConversationRequestStatus
  createdAt: string
  resolvedAt?: string
  /** Presente solo si `status === 'aceptada'`: el grupo que creó el profesor. */
  conversationId?: string
}

export interface CreateGroupConversationRequestInput {
  subjectId: string
  subjectName: string
  reason: string
}

/** Error de dominio (Parte 15, "Validar permisos"): conversación o acción no autorizada por rol. */
export class ChatPermissionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChatPermissionError'
  }
}
