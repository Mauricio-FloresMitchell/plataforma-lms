import { MOCK_USERS } from '@/mocks/users'
import { getSubjectRosterForGamification } from '@/mocks/evaluations'
import {
  addMessageReaction,
  deleteMessage,
  editMessage,
  findConversation,
  findExistingIndividualConversation,
  findGroupRequest,
  findMessage,
  getConversationMembers,
  getMessageStatus,
  getUnreadCount,
  insertAttachment,
  insertConversation,
  insertGroupRequest,
  insertMessage,
  isConversationMember,
  listAttachmentsForConversation,
  listAttachmentsForMessage,
  listConversationsForUser,
  listGroupRequestsForProfessor,
  listGroupRequestsForStudent,
  listMessages,
  listReactionsForMessage,
  markConversationRead,
  removeMessageReaction,
  resolveGroupRequest,
  searchAttachments,
  searchMessages,
  setConversationArchived,
  setConversationClosed,
  setConversationDeleted,
  setConversationMuted,
  setConversationPinned,
} from '@/mocks/chat'
import { getProfessorSubjectsAsync } from '@/services/subject.service'
import { emitAppEvent } from '@/core/events/EventBus'
import { chatSignal } from '@/core/events/chatSignal'
import type { Role } from '@/types/auth'
import {
  ChatPermissionError,
  type Attachment,
  type AttachmentKind,
  type ChatContact,
  type Conversation,
  type ConversationMember,
  type ConversationSummary,
  type CreateConversationInput,
  type CreateGroupConversationRequestInput,
  type GroupConversationRequest,
  type Message,
  type MessageWithDetails,
  type Reaction,
  type ReactionEmoji,
  type SendMessageInput,
} from '@/types/chat'
import { eventNameForAttachment, messageTypeForAttachment } from '@/features/comunicacion/utils/attachmentKind'

/**
 * Capa de acceso a datos del Centro de Comunicación Institucional (Sprint 12).
 *
 * Único punto que valida permisos por rol (Parte 15) y emite los eventos de
 * Chat (Parte 9) — igual que el resto de la plataforma, nunca llama a
 * `notification.service.ts` directamente: emite el evento y deja que
 * `ChatListener`/`NotificationListener` decidan qué hacer.
 */

const NETWORK_DELAY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface CurrentChatUser {
  id: string
  name: string
  role: Role
}

const DEMO_PROFESOR: ChatContact = { id: 'usr-profesor-001', name: 'Carlos Méndez Ruiz', role: 'profesor' }
const DEMO_ADMIN: ChatContact = { id: 'usr-admin-001', name: 'Ana Torres Vega', role: 'administrador' }

// ---------------------------------------------------------------------------
// Directorio de contactos por rol (Parte 1)
//
// El MVP solo tiene una cuenta real por rol (`mocks/users.ts`): un alumno
// habla con "sus profesores" resolviendo siempre a la cuenta demo de
// Profesor, mismo criterio ya usado en Notificaciones/Gamificación/Foro para
// esta misma limitación de datos. El profesor sí resuelve un roster real,
// combinando sus materias (`subject.service.ts`) con el roster de cada una
// (`getSubjectRosterForGamification`, ya usado por `gamification.service.ts`
// para el mismo propósito — mismo patrón de "componer mocks en el servicio").
// ---------------------------------------------------------------------------

/**
 * Roles institucionales con los que el alumno puede escribir (Sprint 16,
 * Parte 2: "el alumno NO puede iniciar conversaciones con otros alumnos,
 * solo con roles institucionales"). La plataforma no tiene una cuenta real
 * por cada área — mismo criterio que el resto del MVP: cada contacto
 * "lógico" resuelve a la única cuenta demo de Administración
 * (`usr-admin-001`), diferenciados solo por `subtitle` para que el alumno
 * elija con quién quiere hablar.
 */
const INSTITUTIONAL_CONTACT_SUBTITLES = ['Área Académica', 'Sistemas', 'Control Escolar', 'Finanzas', 'Soporte']

function getContactsForAlumno(): ChatContact[] {
  return [
    { ...DEMO_PROFESOR, subtitle: 'Profesor' },
    ...INSTITUTIONAL_CONTACT_SUBTITLES.map((subtitle, index) => ({
      ...DEMO_ADMIN,
      id: `${DEMO_ADMIN.id}::${index}`,
      subtitle,
    })),
  ]
}

/** Resuelve el id "lógico" de un contacto institucional (`usr-admin-001::N`) a la cuenta real. */
function resolveRealContactId(contactId: string): string {
  return contactId.split('::')[0]
}

async function getContactsForProfesor(): Promise<ChatContact[]> {
  const subjects = await getProfessorSubjectsAsync()
  const byStudent = new Map<string, ChatContact>()
  for (const subject of subjects) {
    for (const student of getSubjectRosterForGamification(subject.id)) {
      if (!byStudent.has(student.studentId)) {
        byStudent.set(student.studentId, {
          id: student.studentId,
          name: student.studentName,
          role: 'alumno',
          subtitle: subject.name,
        })
      }
    }
  }
  return [...byStudent.values(), { ...DEMO_ADMIN, subtitle: 'Administración' }]
}

function getContactsForAdmin(): ChatContact[] {
  return MOCK_USERS.filter((user) => user.role !== 'administrador').map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
  }))
}

/** Contactos con los que `currentUser` puede iniciar una conversación (Parte 1). */
export async function getAvailableContactsAsync(currentUser: CurrentChatUser): Promise<ChatContact[]> {
  await delay(NETWORK_DELAY_MS)
  if (currentUser.role === 'alumno') return getContactsForAlumno()
  if (currentUser.role === 'profesor') return getContactsForProfesor()
  return getContactsForAdmin()
}

/** Materias que el profesor puede usar para "chat por materia"/"grupo" (Parte 2). */
export async function getMessageableSubjectsAsync(currentUser: CurrentChatUser) {
  if (currentUser.role !== 'profesor') return []
  await delay(NETWORK_DELAY_MS)
  return getProfessorSubjectsAsync()
}

async function assertMembership(currentUser: CurrentChatUser, conversationId: string): Promise<Conversation> {
  const conversation = findConversation(conversationId)
  if (!conversation || conversation.isDeleted || !isConversationMember(conversationId, currentUser.id)) {
    throw new ChatPermissionError('No tienes acceso a esta conversación.')
  }
  return conversation
}

// ---------------------------------------------------------------------------
// Conversaciones
// ---------------------------------------------------------------------------

function toSummary(conversation: Conversation, userId: string): ConversationSummary {
  const members = getConversationMembers(conversation.id)
  const messages = listMessages(conversation.id)
  const lastVisible = [...messages].reverse().find((message) => !message.deleted) ?? null
  return {
    ...conversation,
    members,
    lastMessage: lastVisible,
    unreadCount: getUnreadCount(conversation.id, userId),
  }
}

function sortConversations(summaries: ConversationSummary[]): ConversationSummary[] {
  return [...summaries].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

/** `GET /conversations`. */
export async function getConversationsAsync(currentUser: CurrentChatUser): Promise<ConversationSummary[]> {
  await delay(NETWORK_DELAY_MS)
  const summaries = listConversationsForUser(currentUser.id).map((conversation) => toSummary(conversation, currentUser.id))
  return sortConversations(summaries)
}

/** `GET /conversations/:id`. */
export async function getConversationAsync(
  currentUser: CurrentChatUser,
  conversationId: string,
): Promise<ConversationSummary | null> {
  await delay(NETWORK_DELAY_MS)
  if (!isConversationMember(conversationId, currentUser.id)) return null
  const conversation = findConversation(conversationId)
  if (!conversation || conversation.isDeleted) return null
  return toSummary(conversation, currentUser.id)
}

/** `POST /conversations`. Valida permisos por rol (Parte 1/15) antes de crear nada. */
export async function createConversationAsync(
  currentUser: CurrentChatUser,
  input: CreateConversationInput,
): Promise<Conversation> {
  await delay(NETWORK_DELAY_MS)

  if (currentUser.role === 'alumno' && input.type !== 'individual') {
    throw new ChatPermissionError('El alumno solo puede iniciar conversaciones individuales con su profesor o administración.')
  }
  if (input.participantIds.length === 0) {
    throw new ChatPermissionError('Selecciona al menos un participante.')
  }

  const availableContacts = await getAvailableContactsAsync(currentUser)
  const resolvedParticipants: ChatContact[] = [{ id: currentUser.id, name: currentUser.name, role: currentUser.role }]
  for (const participantId of input.participantIds) {
    const realId = resolveRealContactId(participantId)
    if (realId === currentUser.id) continue
    const contact = availableContacts.find((item) => item.id === participantId)
    if (!contact) {
      throw new ChatPermissionError('No tienes autorización para iniciar una conversación con este usuario.')
    }
    if (resolvedParticipants.some((existing) => existing.id === realId)) continue
    resolvedParticipants.push({ ...contact, id: realId })
  }

  if (input.type === 'individual' && resolvedParticipants.length === 2) {
    const existing = findExistingIndividualConversation(resolvedParticipants[0].id, resolvedParticipants[1].id)
    if (existing) return existing
  }

  const conversation = insertConversation({
    type: input.type,
    title: input.title,
    createdBy: currentUser.id,
    participants: resolvedParticipants,
    contextType: input.contextType,
    contextId: input.contextId,
    contextLabel: input.contextLabel,
  })

  emitAppEvent('CONVERSATION_CREATED', {
    conversationId: conversation.id,
    conversationTitle: conversation.title,
    conversationType: conversation.type,
    createdBy: currentUser.id,
    createdByName: currentUser.name,
    participantIds: resolvedParticipants.map((participant) => participant.id),
  })

  chatSignal.emit('conversation-created', conversation)

  if (input.firstMessage && input.firstMessage.trim()) {
    await sendMessageAsync(currentUser, { conversationId: conversation.id, content: input.firstMessage.trim() })
  }

  return conversation
}

export interface UpdateConversationInput {
  isArchived?: boolean
  isPinned?: boolean
  isMuted?: boolean
  isClosed?: boolean
}

/** `PATCH /conversations/:id`. Archivar/silenciar: cualquier miembro. Fijar y cerrar: solo Administrador (Parte 1). */
export async function updateConversationAsync(
  currentUser: CurrentChatUser,
  conversationId: string,
  patch: UpdateConversationInput,
): Promise<Conversation | null> {
  await delay(NETWORK_DELAY_MS)
  const conversation = await assertMembership(currentUser, conversationId)

  if ((patch.isPinned !== undefined || patch.isClosed !== undefined) && currentUser.role !== 'administrador') {
    throw new ChatPermissionError('Solo Administración puede fijar o cerrar una conversación.')
  }

  let updated: Conversation | null = conversation
  if (patch.isArchived !== undefined) {
    updated = setConversationArchived(conversationId, patch.isArchived)
    emitAppEvent('CONVERSATION_ARCHIVED', {
      conversationId,
      conversationTitle: conversation.title,
      actorId: currentUser.id,
      isArchived: patch.isArchived,
    })
  }
  if (patch.isMuted !== undefined) {
    updated = setConversationMuted(conversationId, patch.isMuted)
  }
  if (patch.isPinned !== undefined) {
    updated = setConversationPinned(conversationId, patch.isPinned)
    emitAppEvent('CONVERSATION_PINNED', {
      conversationId,
      conversationTitle: conversation.title,
      actorId: currentUser.id,
      isPinned: patch.isPinned,
    })
  }
  if (patch.isClosed !== undefined) {
    updated = setConversationClosed(conversationId, patch.isClosed)
  }
  if (updated) chatSignal.emit('conversation-updated', updated)
  return updated
}

export async function archiveConversationAsync(
  currentUser: CurrentChatUser,
  conversationId: string,
  isArchived: boolean,
): Promise<Conversation | null> {
  return updateConversationAsync(currentUser, conversationId, { isArchived })
}

export async function pinConversationAsync(
  currentUser: CurrentChatUser,
  conversationId: string,
  isPinned: boolean,
): Promise<Conversation | null> {
  return updateConversationAsync(currentUser, conversationId, { isPinned })
}

export async function muteConversationAsync(
  currentUser: CurrentChatUser,
  conversationId: string,
  isMuted: boolean,
): Promise<Conversation | null> {
  return updateConversationAsync(currentUser, conversationId, { isMuted })
}

export async function closeConversationAsync(
  currentUser: CurrentChatUser,
  conversationId: string,
  isClosed: boolean,
): Promise<Conversation | null> {
  return updateConversationAsync(currentUser, conversationId, { isClosed })
}

/** `DELETE /conversations/:id`. Borrado suave, solo Administrador. */
export async function removeConversationAsync(currentUser: CurrentChatUser, conversationId: string): Promise<void> {
  await delay(NETWORK_DELAY_MS)
  await assertMembership(currentUser, conversationId)
  if (currentUser.role !== 'administrador') {
    throw new ChatPermissionError('Solo Administración puede eliminar una conversación.')
  }
  const updated = setConversationDeleted(conversationId)
  if (updated) chatSignal.emit('conversation-updated', updated)
}

export async function markConversationReadAsync(currentUser: CurrentChatUser, conversationId: string): Promise<void> {
  await assertMembership(currentUser, conversationId)
  const messages = listMessages(conversationId)
  const lastMessage = messages[messages.length - 1]
  markConversationRead(conversationId, currentUser.id)
  if (lastMessage) {
    emitAppEvent('MESSAGE_READ', { conversationId, userId: currentUser.id, lastReadMessageId: lastMessage.id })
    chatSignal.emit('message-updated', lastMessage)
  }
}

// ---------------------------------------------------------------------------
// Mensajes
// ---------------------------------------------------------------------------

function toMessageWithDetails(message: Message, members: ConversationMember[]): MessageWithDetails {
  const replyTo = message.replyToId ? findMessage(message.replyToId) : null
  return {
    ...message,
    status: getMessageStatus(message, members),
    attachments: listAttachmentsForMessage(message.id),
    reactions: listReactionsForMessage(message.id),
    replyTo,
  }
}

/** `GET /messages/:conversation`. */
export async function getMessagesAsync(currentUser: CurrentChatUser, conversationId: string): Promise<MessageWithDetails[]> {
  await delay(NETWORK_DELAY_MS)
  await assertMembership(currentUser, conversationId)
  const members = getConversationMembers(conversationId)
  return listMessages(conversationId).map((message) => toMessageWithDetails(message, members))
}

/** `POST /messages`. Rechaza si la conversación está cerrada (Parte 1, control de Administrador). */
export async function sendMessageAsync(currentUser: CurrentChatUser, input: SendMessageInput): Promise<Message> {
  await delay(NETWORK_DELAY_MS)
  const conversation = await assertMembership(currentUser, input.conversationId)
  if (conversation.isClosed) {
    throw new ChatPermissionError('Esta conversación está cerrada.')
  }

  const message = insertMessage({
    conversationId: input.conversationId,
    sender: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
    content: input.content,
    type: input.type ?? 'texto',
    replyToId: input.replyToId,
  })

  const members = getConversationMembers(input.conversationId)
  const recipientIds = members.filter((member) => member.userId !== currentUser.id).map((member) => member.userId)

  emitAppEvent('MESSAGE_SENT', {
    messageId: message.id,
    conversationId: conversation.id,
    conversationTitle: conversation.title,
    conversationType: conversation.type,
    senderId: currentUser.id,
    senderName: currentUser.name,
    content: message.content,
    messageType: message.type,
    recipientIds,
  })
  chatSignal.emit('message-sent', message)

  return message
}

/** `PATCH /messages/:id`. Ventana de 5 minutos validada en `mocks/chat.ts`. */
export async function editMessageAsync(currentUser: CurrentChatUser, messageId: string, content: string): Promise<Message | null> {
  await delay(NETWORK_DELAY_MS)
  const message = editMessage(messageId, currentUser.id, content)
  if (!message) return null
  emitAppEvent('MESSAGE_EDITED', { messageId, conversationId: message.conversationId, senderId: currentUser.id })
  chatSignal.emit('message-updated', message)
  return message
}

/** `DELETE /messages/:id`. Borrado suave: solo el autor. */
export async function removeMessageAsync(currentUser: CurrentChatUser, messageId: string): Promise<Message | null> {
  await delay(NETWORK_DELAY_MS)
  const message = deleteMessage(messageId, currentUser.id)
  if (!message) return null
  emitAppEvent('MESSAGE_DELETED', { messageId, conversationId: message.conversationId, senderId: currentUser.id })
  chatSignal.emit('message-updated', message)
  return message
}

// ---------------------------------------------------------------------------
// Adjuntos (Parte 3/7)
// ---------------------------------------------------------------------------

export interface ShareAttachmentInput {
  conversationId: string
  fileName: string
  size: number
  kind: AttachmentKind
  /** Simulado: no hay carga real de archivos en el MVP. */
  url?: string
  replyToId?: string
}

/** `POST /attachments`. Crea el mensaje contenedor y el adjunto en la misma operación (Parte 3). */
export async function shareAttachmentAsync(currentUser: CurrentChatUser, input: ShareAttachmentInput): Promise<Attachment> {
  await delay(NETWORK_DELAY_MS)
  const conversation = await assertMembership(currentUser, input.conversationId)
  if (conversation.isClosed) {
    throw new ChatPermissionError('Esta conversación está cerrada.')
  }

  const message = insertMessage({
    conversationId: input.conversationId,
    sender: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
    content: input.fileName,
    type: messageTypeForAttachment(input.kind),
    replyToId: input.replyToId,
  })

  const attachment = insertAttachment({
    messageId: message.id,
    conversationId: input.conversationId,
    fileName: input.fileName,
    mimeType: input.kind,
    size: input.size,
    url: input.url ?? '#',
    kind: input.kind,
    uploadedBy: currentUser.id,
    uploadedByName: currentUser.name,
  })

  const members = getConversationMembers(input.conversationId)
  const recipientIds = members.filter((member) => member.userId !== currentUser.id).map((member) => member.userId)

  emitAppEvent('MESSAGE_SENT', {
    messageId: message.id,
    conversationId: conversation.id,
    conversationTitle: conversation.title,
    conversationType: conversation.type,
    senderId: currentUser.id,
    senderName: currentUser.name,
    content: message.content,
    messageType: message.type,
    recipientIds,
  })
  emitAppEvent(eventNameForAttachment(input.kind), {
    attachmentId: attachment.id,
    messageId: message.id,
    conversationId: conversation.id,
    conversationTitle: conversation.title,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    sharedBy: currentUser.id,
    sharedByName: currentUser.name,
    recipientIds,
  })
  chatSignal.emit('message-sent', message)

  return attachment
}

/** `GET /attachments/:conversation`. Alimenta el panel "Archivos compartidos" (Parte 7). */
export async function getConversationAttachmentsAsync(currentUser: CurrentChatUser, conversationId: string): Promise<Attachment[]> {
  await delay(NETWORK_DELAY_MS)
  await assertMembership(currentUser, conversationId)
  return listAttachmentsForConversation(conversationId)
}

// ---------------------------------------------------------------------------
// Reacciones
// ---------------------------------------------------------------------------

/** `POST /reactions`. */
export async function addReactionAsync(currentUser: CurrentChatUser, messageId: string, emoji: ReactionEmoji): Promise<Reaction | null> {
  await delay(150)
  const message = findMessage(messageId)
  if (!message) return null
  await assertMembership(currentUser, message.conversationId)

  const reaction = addMessageReaction(messageId, currentUser.id, currentUser.name, emoji)
  if (reaction) {
    emitAppEvent('REACTION_ADDED', {
      messageId,
      conversationId: message.conversationId,
      userId: currentUser.id,
      userName: currentUser.name,
      emoji,
      messageSenderId: message.senderId,
    })
    chatSignal.emit('reaction-changed', { messageId, conversationId: message.conversationId })
  }
  return reaction
}

/** `DELETE /reactions`. */
export async function removeReactionAsync(currentUser: CurrentChatUser, messageId: string, emoji: ReactionEmoji): Promise<void> {
  await delay(150)
  const message = findMessage(messageId)
  if (!message) return
  await assertMembership(currentUser, message.conversationId)

  const removed = removeMessageReaction(messageId, currentUser.id, emoji)
  if (removed) {
    emitAppEvent('REACTION_REMOVED', {
      messageId,
      conversationId: message.conversationId,
      userId: currentUser.id,
      userName: currentUser.name,
      emoji,
      messageSenderId: message.senderId,
    })
    chatSignal.emit('reaction-changed', { messageId, conversationId: message.conversationId })
  }
}

// ---------------------------------------------------------------------------
// Búsqueda (Parte 6): usuarios y materias se resuelven aquí (directorio),
// mensajes y archivos delegan a `mocks/chat.ts` (ya acotados a las
// conversaciones del usuario).
// ---------------------------------------------------------------------------

export interface ChatSearchResults {
  contacts: ChatContact[]
  messages: Message[]
  attachments: Attachment[]
}

export async function searchChatAsync(currentUser: CurrentChatUser, query: string): Promise<ChatSearchResults> {
  await delay(NETWORK_DELAY_MS)
  const term = query.trim().toLowerCase()
  if (!term) return { contacts: [], messages: [], attachments: [] }

  const contacts = await getAvailableContactsAsync(currentUser)
  return {
    contacts: contacts.filter((contact) => contact.name.toLowerCase().includes(term)),
    messages: searchMessages(currentUser.id, term),
    attachments: searchAttachments(currentUser.id, term),
  }
}

// ---------------------------------------------------------------------------
// Solicitud de grupo de conversación (Sprint 16, Parte 2)
//
// El alumno no puede crear conversaciones grupales (ver validación en
// `createConversationAsync`); en su lugar solicita un grupo al profesor de la
// materia. Con una sola cuenta demo de Profesor, la solicitud siempre se
// dirige a `DEMO_PROFESOR` — mismo criterio que el resto del módulo.
// ---------------------------------------------------------------------------

/** `POST /group-requests`. Solo el alumno solicita. */
export async function requestGroupConversationAsync(
  student: CurrentChatUser,
  input: CreateGroupConversationRequestInput,
): Promise<GroupConversationRequest> {
  await delay(NETWORK_DELAY_MS)
  if (student.role !== 'alumno') {
    throw new ChatPermissionError('Solo el alumno puede solicitar un grupo de conversación.')
  }
  const request = insertGroupRequest(student, DEMO_PROFESOR.id, input)
  emitAppEvent('GROUP_REQUEST_CREATED', {
    requestId: request.id,
    subjectId: request.subjectId,
    subjectName: request.subjectName,
    studentId: student.id,
    studentName: student.name,
    professorId: request.professorId,
    reason: request.reason,
  })
  return request
}

/** `GET /group-requests` — pendientes y resueltas dirigidas al profesor en sesión. */
export async function getGroupRequestsForProfessorAsync(professorId: string): Promise<GroupConversationRequest[]> {
  await delay(NETWORK_DELAY_MS)
  return listGroupRequestsForProfessor(professorId)
}

/** `GET /group-requests/mine` — historial del alumno en sesión. */
export async function getGroupRequestsForStudentAsync(studentId: string): Promise<GroupConversationRequest[]> {
  await delay(NETWORK_DELAY_MS)
  return listGroupRequestsForStudent(studentId)
}

/**
 * El profesor rechaza la solicitud, sin crear ninguna conversación.
 */
export async function rejectGroupRequestAsync(currentUser: CurrentChatUser, requestId: string): Promise<GroupConversationRequest | null> {
  await delay(NETWORK_DELAY_MS)
  if (currentUser.role !== 'profesor') throw new ChatPermissionError('Solo el profesor puede resolver esta solicitud.')
  const resolved = resolveGroupRequest(requestId, 'rechazada')
  if (resolved) {
    emitAppEvent('GROUP_REQUEST_RESOLVED', {
      requestId: resolved.id,
      studentId: resolved.studentId,
      subjectName: resolved.subjectName,
      status: 'rechazada',
    })
  }
  return resolved
}

/**
 * El profesor acepta la solicitud y crea el grupo: queda como moderador
 * (`createdBy` → rol `admin` en `insertConversation`) junto con el alumno
 * solicitante y los compañeros que haya elegido de su roster.
 */
export async function acceptGroupRequestAsync(
  currentUser: CurrentChatUser,
  requestId: string,
  additionalStudentIds: string[],
): Promise<GroupConversationRequest | null> {
  await delay(NETWORK_DELAY_MS)
  if (currentUser.role !== 'profesor') throw new ChatPermissionError('Solo el profesor puede resolver esta solicitud.')
  const request = findGroupRequest(requestId)
  if (!request || request.status !== 'pendiente') return null

  const conversation = await createConversationAsync(currentUser, {
    type: 'grupal',
    title: `Grupo — ${request.subjectName}`,
    participantIds: [...new Set([request.studentId, ...additionalStudentIds])],
    contextType: undefined,
    contextId: undefined,
    firstMessage: `Grupo creado a partir de la solicitud de ${request.studentName} para ${request.subjectName}.`,
  })

  const resolved = resolveGroupRequest(requestId, 'aceptada', conversation.id)
  if (resolved) {
    emitAppEvent('GROUP_REQUEST_RESOLVED', {
      requestId: resolved.id,
      studentId: resolved.studentId,
      subjectName: resolved.subjectName,
      status: 'aceptada',
      conversationId: conversation.id,
    })
  }
  return resolved
}
