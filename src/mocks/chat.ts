import type {
  Attachment,
  AttachmentKind,
  ChatContact,
  Conversation,
  ConversationMember,
  ConversationMemberRole,
  ConversationType,
  CreateGroupConversationRequestInput,
  GroupConversationRequest,
  GroupConversationRequestStatus,
  Message,
  MessageStatus,
  MessageType,
  Reaction,
  ReactionEmoji,
} from '@/types/chat'

/**
 * Almacén simulado del Centro de Comunicación Institucional (Sprint 12).
 *
 * Estado en memoria durante la sesión, mismo criterio que el resto de los
 * mocks del proyecto. No importa otros mocks (evaluaciones, materias, foro):
 * `chat.service.ts` es quien resuelve "con quién puede hablar" combinando
 * varias fuentes y le pasa a este archivo únicamente los datos ya resueltos
 * (id/nombre/rol) — mismo criterio de "sin import cruzado" que `mocks/evaluations.ts`.
 */

/** Participante ya resuelto (id/nombre/rol) — reutiliza la forma de `ChatContact`. */
type Participant = ChatContact

function daysAgo(days: number, hours = 0): string {
  return new Date(Date.now() - days * 86_400_000 - hours * 3_600_000).toISOString()
}

let sequence = 100

function nextId(prefix: string): string {
  sequence += 1
  return `${prefix}-${sequence}`
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function seedConversation(
  id: string,
  type: ConversationType,
  title: string,
  createdBy: string,
  participants: Participant[],
  options: { isPinned?: boolean; contextType?: Conversation['contextType']; contextId?: string; contextLabel?: string } = {},
): { conversation: Conversation; members: ConversationMember[] } {
  const createdAt = daysAgo(6)
  const conversation: Conversation = {
    id,
    type,
    title,
    createdBy,
    createdAt,
    updatedAt: createdAt,
    isArchived: false,
    isPinned: options.isPinned ?? false,
    isMuted: false,
    isClosed: false,
    isDeleted: false,
    contextType: options.contextType,
    contextId: options.contextId,
    contextLabel: options.contextLabel,
  }
  const members: ConversationMember[] = participants.map((participant) => ({
    conversationId: id,
    userId: participant.id,
    userName: participant.name,
    userRole: participant.role,
    role: participant.id === createdBy ? 'admin' : 'miembro',
    joinedAt: createdAt,
  }))
  return { conversation, members }
}

const MARIA: Participant = { id: 'usr-alumno-001', name: 'María García López', role: 'alumno' }
const CARLOS: Participant = { id: 'usr-profesor-001', name: 'Carlos Méndez Ruiz', role: 'profesor' }
const ANA: Participant = { id: 'usr-admin-001', name: 'Ana Torres Vega', role: 'administrador' }

const seed1 = seedConversation('conv-001', 'individual', 'María García López, Carlos Méndez Ruiz', CARLOS.id, [MARIA, CARLOS], {
  contextType: 'evaluacion',
  contextId: 'eval-001',
  contextLabel: 'Evaluación — Administración Estratégica',
})
const seed2 = seedConversation('conv-002', 'individual', 'María García López, Ana Torres Vega', MARIA.id, [MARIA, ANA])
const seed3 = seedConversation('conv-003', 'institucional', 'Comunicados Institucionales', ANA.id, [MARIA, CARLOS, ANA], {
  isPinned: true,
})

let CONVERSATIONS: Conversation[] = [seed1.conversation, seed2.conversation, seed3.conversation]
let MEMBERS: ConversationMember[] = [...seed1.members, ...seed2.members, ...seed3.members]

function seedMessage(
  conversationId: string,
  sender: Participant,
  content: string,
  ageDays: number,
  ageHours = 0,
  replyToId?: string,
): Message {
  const createdAt = daysAgo(ageDays, ageHours)
  return {
    id: nextId('msg'),
    conversationId,
    senderId: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    content,
    type: 'texto',
    replyToId,
    edited: false,
    deleted: false,
    createdAt,
    updatedAt: createdAt,
  }
}

const conv1Msg1 = seedMessage(
  'conv-001',
  CARLOS,
  'Hola María, ya revisé tu evaluación de Administración Estratégica; dejé retroalimentación sobre el análisis FODA.',
  2,
  4,
)
const conv1Msg2 = seedMessage(
  'conv-001',
  MARIA,
  '¡Gracias, profesor! ¿Podría darme un poco más de detalle sobre la parte de estrategias de precio?',
  2,
  2,
  conv1Msg1.id,
)
const conv1Msg3 = seedMessage(
  'conv-001',
  CARLOS,
  'Claro, lo vemos en la próxima asesoría. Mientras tanto revisa el material de la unidad 3.',
  1,
)

const conv2Msg1 = seedMessage('conv-002', MARIA, 'Buenas tardes, quisiera confirmar mi documentación de matrícula del ciclo 2026-1.', 3, 3)
const conv2Msg2 = seedMessage('conv-002', ANA, 'Hola María, todo en orden: tu matrícula quedó confirmada.', 3)

const conv3Msg1 = seedMessage(
  'conv-003',
  ANA,
  'Bienvenidos al nuevo Centro de Comunicación de Imperalianz. Aquí encontrarán avisos institucionales importantes.',
  5,
)

let MESSAGES: Message[] = [conv1Msg1, conv1Msg2, conv1Msg3, conv2Msg1, conv2Msg2, conv3Msg1]
let ATTACHMENTS: Attachment[] = []
let REACTIONS: Reaction[] = []

/** Cada quien ya leyó lo suyo hasta el mensaje que envió; el resto queda pendiente a propósito (demo de contador de no leídos). */
function setMemberLastRead(conversationId: string, userId: string, lastReadAt: string) {
  const member = MEMBERS.find((item) => item.conversationId === conversationId && item.userId === userId)
  if (member) member.lastReadAt = lastReadAt
}
setMemberLastRead('conv-001', MARIA.id, conv1Msg2.createdAt)
setMemberLastRead('conv-001', CARLOS.id, conv1Msg3.createdAt)
setMemberLastRead('conv-002', MARIA.id, conv2Msg1.createdAt)
setMemberLastRead('conv-002', ANA.id, conv2Msg2.createdAt)
setMemberLastRead('conv-003', ANA.id, conv3Msg1.createdAt)

// ---------------------------------------------------------------------------
// Conversaciones
// ---------------------------------------------------------------------------

export function listConversationsForUser(userId: string): Conversation[] {
  const conversationIds = new Set(MEMBERS.filter((member) => member.userId === userId).map((member) => member.conversationId))
  return CONVERSATIONS.filter((conversation) => conversationIds.has(conversation.id) && !conversation.isDeleted).map(clone)
}

export function findConversation(conversationId: string): Conversation | null {
  const conversation = CONVERSATIONS.find((item) => item.id === conversationId)
  return conversation ? clone(conversation) : null
}

export function getConversationMembers(conversationId: string): ConversationMember[] {
  return MEMBERS.filter((member) => member.conversationId === conversationId).map(clone)
}

export function isConversationMember(conversationId: string, userId: string): boolean {
  return MEMBERS.some((member) => member.conversationId === conversationId && member.userId === userId)
}

/** Evita duplicar conversaciones individuales: reutiliza la existente entre exactamente estos dos usuarios. */
export function findExistingIndividualConversation(userAId: string, userBId: string): Conversation | null {
  const individualConversations = CONVERSATIONS.filter((item) => item.type === 'individual')
  for (const conversation of individualConversations) {
    const memberIds = MEMBERS.filter((member) => member.conversationId === conversation.id).map((member) => member.userId)
    if (memberIds.length === 2 && memberIds.includes(userAId) && memberIds.includes(userBId)) {
      return clone(conversation)
    }
  }
  return null
}

export interface InsertConversationInput {
  type: ConversationType
  title: string
  createdBy: string
  participants: Participant[]
  contextType?: Conversation['contextType']
  contextId?: string
  contextLabel?: string
}

export function insertConversation(input: InsertConversationInput): Conversation {
  const now = new Date().toISOString()
  const conversation: Conversation = {
    id: nextId('conv'),
    type: input.type,
    title: input.title,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
    isPinned: false,
    isMuted: false,
    isClosed: false,
    isDeleted: false,
    contextType: input.contextType,
    contextId: input.contextId,
    contextLabel: input.contextLabel,
  }
  const members: ConversationMember[] = input.participants.map((participant) => ({
    conversationId: conversation.id,
    userId: participant.id,
    userName: participant.name,
    userRole: participant.role,
    role: (participant.id === input.createdBy ? 'admin' : 'miembro') satisfies ConversationMemberRole,
    joinedAt: now,
    lastReadAt: participant.id === input.createdBy ? now : undefined,
  }))
  CONVERSATIONS = [conversation, ...CONVERSATIONS]
  MEMBERS = [...MEMBERS, ...members]
  return clone(conversation)
}

function touchConversation(conversationId: string) {
  const conversation = CONVERSATIONS.find((item) => item.id === conversationId)
  if (conversation) conversation.updatedAt = new Date().toISOString()
}

export function setConversationArchived(conversationId: string, isArchived: boolean): Conversation | null {
  const conversation = CONVERSATIONS.find((item) => item.id === conversationId)
  if (!conversation) return null
  conversation.isArchived = isArchived
  return clone(conversation)
}

export function setConversationPinned(conversationId: string, isPinned: boolean): Conversation | null {
  const conversation = CONVERSATIONS.find((item) => item.id === conversationId)
  if (!conversation) return null
  conversation.isPinned = isPinned
  return clone(conversation)
}

export function setConversationMuted(conversationId: string, isMuted: boolean): Conversation | null {
  const conversation = CONVERSATIONS.find((item) => item.id === conversationId)
  if (!conversation) return null
  conversation.isMuted = isMuted
  return clone(conversation)
}

export function setConversationClosed(conversationId: string, isClosed: boolean): Conversation | null {
  const conversation = CONVERSATIONS.find((item) => item.id === conversationId)
  if (!conversation) return null
  conversation.isClosed = isClosed
  return clone(conversation)
}

/** Borrado suave (Administrador). El registro permanece; `listConversationsForUser` lo excluye. */
export function setConversationDeleted(conversationId: string): Conversation | null {
  const conversation = CONVERSATIONS.find((item) => item.id === conversationId)
  if (!conversation) return null
  conversation.isDeleted = true
  return clone(conversation)
}

export function markConversationRead(conversationId: string, userId: string): void {
  setMemberLastRead(conversationId, userId, new Date().toISOString())
}

export function getUnreadCount(conversationId: string, userId: string): number {
  const member = MEMBERS.find((item) => item.conversationId === conversationId && item.userId === userId)
  const lastReadAt = member?.lastReadAt
  return MESSAGES.filter((message) => {
    if (message.conversationId !== conversationId || message.senderId === userId || message.deleted) return false
    return !lastReadAt || message.createdAt > lastReadAt
  }).length
}

// ---------------------------------------------------------------------------
// Mensajes
// ---------------------------------------------------------------------------

export function listMessages(conversationId: string): Message[] {
  return MESSAGES.filter((message) => message.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(clone)
}

export function findMessage(messageId: string): Message | null {
  const message = MESSAGES.find((item) => item.id === messageId)
  return message ? clone(message) : null
}

export interface InsertMessageInput {
  conversationId: string
  sender: Participant
  content: string
  type: MessageType
  replyToId?: string
}

export function insertMessage(input: InsertMessageInput): Message {
  const now = new Date().toISOString()
  const message: Message = {
    id: nextId('msg'),
    conversationId: input.conversationId,
    senderId: input.sender.id,
    senderName: input.sender.name,
    senderRole: input.sender.role,
    content: input.content,
    type: input.type,
    replyToId: input.replyToId,
    edited: false,
    deleted: false,
    createdAt: now,
    updatedAt: now,
  }
  MESSAGES = [...MESSAGES, message]
  touchConversation(input.conversationId)
  setMemberLastRead(input.conversationId, input.sender.id, now)
  return clone(message)
}

/** Ventana de edición de 5 minutos (Parte 3). Devuelve `null` si expiró, no es del autor o no existe. */
export function editMessage(messageId: string, senderId: string, content: string): Message | null {
  const message = MESSAGES.find((item) => item.id === messageId)
  if (!message || message.senderId !== senderId || message.deleted) return null
  const elapsedMs = Date.now() - new Date(message.createdAt).getTime()
  if (elapsedMs > 5 * 60 * 1000) return null

  message.content = content
  message.edited = true
  message.editedAt = new Date().toISOString()
  message.updatedAt = message.editedAt
  return clone(message)
}

export function deleteMessage(messageId: string, senderId: string): Message | null {
  const message = MESSAGES.find((item) => item.id === messageId)
  if (!message || message.senderId !== senderId) return null
  message.deleted = true
  message.deletedAt = new Date().toISOString()
  message.updatedAt = message.deletedAt
  return clone(message)
}

/** Estado agregado del mensaje (Parte 4): calculado a partir de `lastReadAt` del resto de los miembros, no almacenado. */
export function getMessageStatus(message: Message, members: ConversationMember[]): MessageStatus {
  const others = members.filter((member) => member.userId !== message.senderId)
  if (others.length === 0) return 'entregado'
  const allRead = others.every((member) => member.lastReadAt && member.lastReadAt >= message.createdAt)
  return allRead ? 'leido' : 'entregado'
}

// ---------------------------------------------------------------------------
// Adjuntos
// ---------------------------------------------------------------------------

export interface InsertAttachmentInput {
  messageId: string
  conversationId: string
  fileName: string
  mimeType: string
  size: number
  url: string
  kind: AttachmentKind
  uploadedBy: string
  uploadedByName: string
}

export function insertAttachment(input: InsertAttachmentInput): Attachment {
  const attachment: Attachment = {
    id: nextId('att'),
    ...input,
    createdAt: new Date().toISOString(),
  }
  ATTACHMENTS = [...ATTACHMENTS, attachment]
  return clone(attachment)
}

export function listAttachmentsForConversation(conversationId: string): Attachment[] {
  return ATTACHMENTS.filter((item) => item.conversationId === conversationId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(clone)
}

export function listAttachmentsForMessage(messageId: string): Attachment[] {
  return ATTACHMENTS.filter((item) => item.messageId === messageId).map(clone)
}

// ---------------------------------------------------------------------------
// Reacciones
// ---------------------------------------------------------------------------

export function listReactionsForMessage(messageId: string): Reaction[] {
  return REACTIONS.filter((item) => item.messageId === messageId).map(clone)
}

/** `POST /reactions`. Idempotente: no duplica si el usuario ya reaccionó con ese emoji. */
export function addMessageReaction(messageId: string, userId: string, userName: string, emoji: ReactionEmoji): Reaction | null {
  const message = MESSAGES.find((item) => item.id === messageId)
  if (!message) return null

  const existing = REACTIONS.find((item) => item.messageId === messageId && item.userId === userId && item.emoji === emoji)
  if (existing) return clone(existing)

  const reaction: Reaction = { id: nextId('rxn'), messageId, userId, userName, emoji }
  REACTIONS = [...REACTIONS, reaction]
  return clone(reaction)
}

/** `DELETE /reactions`. Devuelve la reacción eliminada, o `null` si no existía. */
export function removeMessageReaction(messageId: string, userId: string, emoji: ReactionEmoji): Reaction | null {
  const existing = REACTIONS.find((item) => item.messageId === messageId && item.userId === userId && item.emoji === emoji)
  if (!existing) return null
  REACTIONS = REACTIONS.filter((item) => item.id !== existing.id)
  return clone(existing)
}

// ---------------------------------------------------------------------------
// Búsqueda (Parte 6: mensajes y archivos; usuarios/materias se resuelven en el servicio)
// ---------------------------------------------------------------------------

export function searchMessages(userId: string, query: string): Message[] {
  const term = query.trim().toLowerCase()
  if (!term) return []
  const conversationIds = new Set(MEMBERS.filter((member) => member.userId === userId).map((member) => member.conversationId))
  return MESSAGES.filter(
    (message) => conversationIds.has(message.conversationId) && !message.deleted && message.content.toLowerCase().includes(term),
  ).map(clone)
}

export function searchAttachments(userId: string, query: string): Attachment[] {
  const term = query.trim().toLowerCase()
  if (!term) return []
  const conversationIds = new Set(MEMBERS.filter((member) => member.userId === userId).map((member) => member.conversationId))
  return ATTACHMENTS.filter(
    (attachment) => conversationIds.has(attachment.conversationId) && attachment.fileName.toLowerCase().includes(term),
  ).map(clone)
}

// ---------------------------------------------------------------------------
// Solicitudes de grupo de conversación (Sprint 16, Parte 2)
// ---------------------------------------------------------------------------

let GROUP_REQUESTS: GroupConversationRequest[] = []

export function insertGroupRequest(
  student: Participant,
  professorId: string,
  input: CreateGroupConversationRequestInput,
): GroupConversationRequest {
  const request: GroupConversationRequest = {
    id: nextId('greq'),
    subjectId: input.subjectId,
    subjectName: input.subjectName,
    studentId: student.id,
    studentName: student.name,
    professorId,
    reason: input.reason,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  }
  GROUP_REQUESTS = [request, ...GROUP_REQUESTS]
  return request
}

export function listGroupRequestsForProfessor(professorId: string): GroupConversationRequest[] {
  return GROUP_REQUESTS.filter((request) => request.professorId === professorId).map(clone)
}

export function listGroupRequestsForStudent(studentId: string): GroupConversationRequest[] {
  return GROUP_REQUESTS.filter((request) => request.studentId === studentId).map(clone)
}

export function findGroupRequest(requestId: string): GroupConversationRequest | null {
  return GROUP_REQUESTS.find((request) => request.id === requestId) ?? null
}

export function resolveGroupRequest(
  requestId: string,
  status: Extract<GroupConversationRequestStatus, 'aceptada' | 'rechazada'>,
  conversationId?: string,
): GroupConversationRequest | null {
  const request = GROUP_REQUESTS.find((item) => item.id === requestId)
  if (!request || request.status !== 'pendiente') return null
  request.status = status
  request.resolvedAt = new Date().toISOString()
  request.conversationId = conversationId
  return clone(request)
}
