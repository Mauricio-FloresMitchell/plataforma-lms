import type {
  CreateForumPostInput,
  CreateForumReportInput,
  FeaturedAnswerEvent,
  ForumAttachment,
  ForumAuthor,
  ForumCategory,
  ForumComment,
  ForumModerationAction,
  ForumNotification,
  ForumNotificationType,
  ForumPost,
  ForumReactionEmoji,
  ForumReactionSummary,
  ForumReply,
  ForumReport,
  ForumReportStatus,
  ModerationLogEntry,
  UserModerationStatus,
  UserWarning,
} from '@/types/forum'
import { FORUM_REACTION_EMOJIS } from '@/types/forum'

/**
 * Almacén simulado del Foro Académico.
 *
 * Estado en memoria: publicaciones, comentarios, reacciones, notificaciones,
 * reportes e historial de moderación se reflejan durante la sesión y se
 * reinician al recargar. No hay persistencia real.
 *
 * Internamente las reacciones se guardan como `userIds` por emoji (para poder
 * calcular "reactedByMe" según quién consulte); `toPublic*` las convierte al
 * resumen público (`ForumReactionSummary`) que consumen los componentes.
 */

interface StoredReaction {
  emoji: ForumReactionEmoji
  userIds: string[]
}

interface StoredReply extends Omit<ForumReply, 'reactions'> {
  reactions: StoredReaction[]
}

interface StoredComment extends Omit<ForumComment, 'reactions' | 'replies'> {
  reactions: StoredReaction[]
  replies: StoredReply[]
}

interface StoredPost extends Omit<ForumPost, 'comments'> {
  comments: StoredComment[]
}

export const FORUM_CATEGORIES: ForumCategory[] = [
  { id: 'general', name: 'General' },
  { id: 'dudas', name: 'Dudas académicas' },
  { id: 'proyectos', name: 'Proyectos' },
  { id: 'recursos', name: 'Recursos' },
  { id: 'anuncios', name: 'Anuncios' },
]

const AUTHORS: Record<string, ForumAuthor> = {
  andrea: { id: 'usr-alumno-001', name: 'Andrea Guadalupe Mendez Guzman', role: 'alumno', initials: 'AM' },
  axel: { id: 'std-002', name: 'Axel Martínez Betanzos', role: 'alumno', initials: 'AB' },
  yesus: { id: 'usr-profesor-001', name: 'Lic. Yesus Eleazar González', role: 'profesor', initials: 'YG' },
  ana: { id: 'usr-admin-001', name: 'Ana Torres Vega', role: 'administrador', initials: 'AT' },
}

function reaction(emoji: ForumReactionEmoji, userIds: string[]): StoredReaction {
  return { emoji, userIds }
}

let POSTS: StoredPost[] = [
  {
    id: 'post-001',
    title: '¿Cómo estructurar el análisis de la cadena de valor?',
    excerpt:
      'Tengo dudas sobre cómo separar las actividades primarias de las de apoyo en el reporte…',
    content:
      'Estoy trabajando en el reporte de la semana y no me queda claro cómo separar las actividades primarias de las de apoyo. ¿Alguien tiene un ejemplo aplicado a una empresa de servicios?',
    categoryId: 'dudas',
    categoryName: 'Dudas académicas',
    tags: ['administración', 'reportes'],
    author: AUTHORS.andrea,
    createdAt: '2026-07-22T16:00:00.000Z',
    commentCount: 0,
    isPinned: false,
    isClosed: false,
    isDeleted: false,
    comments: [
      {
        id: 'cmt-001',
        author: AUTHORS.yesus,
        content:
          'Buena pregunta, Andrea. Empieza por identificar las actividades que agregan valor directo al servicio (operaciones, marketing) y luego las de soporte (infraestructura, RRHH).',
        createdAt: '2026-07-22T17:10:00.000Z',
        reactions: [reaction('👍', [AUTHORS.andrea.id, AUTHORS.axel.id])],
        isFeatured: true,
        featuredByName: AUTHORS.ana.name,
        featuredAt: '2026-07-23T09:00:00.000Z',
        isDeleted: false,
        replies: [
          {
            id: 'rep-001',
            author: AUTHORS.andrea,
            content: 'Gracias, profesor. ¿La atención al cliente contaría como actividad primaria?',
            createdAt: '2026-07-22T17:40:00.000Z',
            reactions: [],
            isFeatured: false,
            isDeleted: false,
          },
          {
            id: 'rep-002',
            author: AUTHORS.yesus,
            content: 'En una empresa de servicios, sí: es parte del núcleo de la operación.',
            createdAt: '2026-07-22T18:05:00.000Z',
            reactions: [reaction('💡', [AUTHORS.andrea.id])],
            isFeatured: false,
            isDeleted: false,
          },
        ],
      },
      {
        id: 'cmt-002',
        author: AUTHORS.axel,
        content: 'Yo usé el modelo de Porter y me ayudó a ordenar las ideas.',
        createdAt: '2026-07-22T19:00:00.000Z',
        reactions: [],
        isFeatured: false,
        isDeleted: false,
        replies: [],
      },
    ],
  },
  {
    id: 'post-002',
    title: 'Recursos recomendados para el análisis de casos',
    excerpt: 'Comparto una lista de lecturas y plantillas que me sirvieron mucho…',
    content:
      'Dejo por aquí algunas lecturas y plantillas que me ayudaron a estructurar el análisis de casos de la materia. Si tienen más recursos, agréguenlos en los comentarios.',
    categoryId: 'recursos',
    categoryName: 'Recursos',
    tags: ['clase-modelo', 'recursos'],
    author: AUTHORS.yesus,
    createdAt: '2026-07-21T14:30:00.000Z',
    commentCount: 0,
    isPinned: false,
    isClosed: false,
    isDeleted: false,
    comments: [
      {
        id: 'cmt-003',
        author: AUTHORS.andrea,
        content: '¡Excelente, profesor! La plantilla me viene perfecta.',
        createdAt: '2026-07-21T15:20:00.000Z',
        reactions: [],
        isFeatured: false,
        isDeleted: false,
        replies: [],
      },
    ],
  },
  {
    id: 'post-003',
    title: 'Cierre del periodo: fechas importantes',
    excerpt: 'Recordatorio de las fechas clave para el cierre del Ciclo 2026-1…',
    content:
      'Les recuerdo que la entrega de reportes cierra el 31 de julio y la captura de evaluaciones el mismo día. Cualquier duda, coméntenla aquí.',
    categoryId: 'anuncios',
    categoryName: 'Anuncios',
    tags: ['ciclo-2026-1', 'avisos'],
    author: AUTHORS.ana,
    createdAt: '2026-07-20T09:00:00.000Z',
    commentCount: 0,
    isPinned: true,
    pinnedByName: AUTHORS.ana.name,
    isClosed: false,
    isDeleted: false,
    comments: [],
  },
  {
    id: 'post-004',
    title: 'Buscamos integrante para proyecto final',
    excerpt: 'Somos un equipo de tres y nos falta una persona para el proyecto final…',
    content:
      'Estamos desarrollando una propuesta para el proyecto final de la materia y buscamos una persona más para el equipo. Si te interesa, comenta aquí.',
    categoryId: 'proyectos',
    categoryName: 'Proyectos',
    tags: ['proyecto-final', 'equipo'],
    author: AUTHORS.axel,
    createdAt: '2026-07-19T11:15:00.000Z',
    commentCount: 0,
    isPinned: false,
    isClosed: false,
    isDeleted: false,
    comments: [
      {
        id: 'cmt-004',
        author: AUTHORS.andrea,
        content: 'Me interesa, cuenta conmigo.',
        createdAt: '2026-07-19T12:00:00.000Z',
        reactions: [],
        isFeatured: false,
        isDeleted: false,
        replies: [
          {
            id: 'rep-003',
            author: AUTHORS.axel,
            content: '¡Genial! Te escribo por interno para coordinar.',
            createdAt: '2026-07-19T12:30:00.000Z',
            reactions: [],
            isFeatured: false,
            isDeleted: false,
          },
        ],
      },
    ],
  },
]

let NOTIFICATIONS: ForumNotification[] = []
let FEATURED_ANSWER_EVENTS: FeaturedAnswerEvent[] = []
let REPORTS: ForumReport[] = []
let MODERATION_LOG: ModerationLogEntry[] = []
let WARNINGS: UserWarning[] = []

let sequence = 100

function clone<T>(value: T): T {
  return structuredClone(value)
}

function countComments(post: StoredPost): number {
  return post.comments.reduce((total, comment) => total + 1 + comment.replies.length, 0)
}

function toReactionSummaries(reactions: StoredReaction[], viewerId: string | undefined): ForumReactionSummary[] {
  return FORUM_REACTION_EMOJIS.map((emoji) => {
    const userIds = reactions.find((item) => item.emoji === emoji)?.userIds ?? []
    return { emoji, count: userIds.length, reactedByMe: viewerId ? userIds.includes(viewerId) : false }
  })
}

function toPublicReply(reply: StoredReply, viewerId: string | undefined): ForumReply {
  return { ...reply, reactions: toReactionSummaries(reply.reactions, viewerId) }
}

function toPublicComment(comment: StoredComment, viewerId: string | undefined): ForumComment {
  return {
    ...comment,
    reactions: toReactionSummaries(comment.reactions, viewerId),
    replies: comment.replies.map((reply) => toPublicReply(reply, viewerId)),
  }
}

function toPublicPost(post: StoredPost, viewerId: string | undefined): ForumPost {
  return {
    ...clone(post),
    comments: post.comments.map((comment) => toPublicComment(comment, viewerId)),
    commentCount: countComments(post),
  }
}

/** Feed público: excluye publicaciones eliminadas. `findPost` sí las devuelve (detalle/moderación). */
export function listPosts(viewerId?: string): ForumPost[] {
  return POSTS.filter((post) => !post.isDeleted).map((post) => toPublicPost(post, viewerId))
}

export function findPost(postId: string, viewerId?: string): ForumPost | null {
  const post = POSTS.find((item) => item.id === postId)
  return post ? toPublicPost(post, viewerId) : null
}

export function insertPost(author: ForumAuthor, input: CreateForumPostInput): ForumPost {
  const category = FORUM_CATEGORIES.find((item) => item.id === input.categoryId)
  sequence += 1
  const post: StoredPost = {
    id: `post-${sequence}`,
    title: input.title,
    excerpt: input.content.slice(0, 120),
    content: input.content,
    categoryId: input.categoryId,
    categoryName: category?.name ?? 'General',
    tags: input.tags,
    author,
    createdAt: new Date().toISOString(),
    commentCount: 0,
    isPinned: false,
    isClosed: false,
    isDeleted: false,
    comments: [],
    attachments: input.attachments,
  }
  POSTS = [post, ...POSTS]
  return toPublicPost(post, author.id)
}

function findStoredPost(postId: string): StoredPost | undefined {
  return POSTS.find((item) => item.id === postId)
}

/** Busca un comentario o una respuesta por id dentro de una publicación (las respuestas no requieren el id del comentario padre). */
function findCommentOrReply(
  post: StoredPost,
  targetType: 'comment' | 'reply',
  targetId: string,
): StoredComment | StoredReply | undefined {
  if (targetType === 'comment') {
    return post.comments.find((item) => item.id === targetId)
  }
  for (const comment of post.comments) {
    const reply = comment.replies.find((item) => item.id === targetId)
    if (reply) return reply
  }
  return undefined
}

function pushNotification(
  recipientId: string,
  type: ForumNotificationType,
  postId: string,
  postTitle: string,
  actorName: string,
  excerpt: string,
) {
  sequence += 1
  const notification: ForumNotification = {
    id: `notif-${sequence}`,
    recipientId,
    type,
    postId,
    postTitle,
    actorName,
    excerpt: excerpt.length > 140 ? `${excerpt.slice(0, 140)}…` : excerpt,
    createdAt: new Date().toISOString(),
    read: false,
  }
  NOTIFICATIONS = [notification, ...NOTIFICATIONS]
}

/**
 * Detección de menciones simple para MVP: busca `@Nombre` o `@Nombre Apellido`
 * en el texto y notifica a cualquier autor conocido del foro cuyo nombre
 * empiece con ese texto (sin acentos/mayúsculas). No hay autocompletado.
 */
function createMentionNotifications(content: string, actor: ForumAuthor, post: StoredPost) {
  const matches = [...content.matchAll(/@([\p{L}]+(?:\s[\p{L}]+)?)/gu)].map((match) => match[1].toLowerCase())
  if (matches.length === 0) return

  const recipients = new Set<string>()
  for (const candidate of Object.values(AUTHORS)) {
    if (candidate.id === actor.id) continue
    const candidateName = candidate.name.toLowerCase()
    if (matches.some((mention) => candidateName.startsWith(mention))) {
      recipients.add(candidate.id)
    }
  }

  recipients.forEach((recipientId) => pushNotification(recipientId, 'mention', post.id, post.title, actor.name, content))
}

/** Crea un comentario nuevo en una publicación. Rechaza si está cerrada o eliminada. Notifica al autor de la publicación y a las menciones. */
export function addComment(postId: string, author: ForumAuthor, content: string, attachments?: ForumAttachment[]): ForumPost | null {
  const post = findStoredPost(postId)
  if (!post || post.isClosed || post.isDeleted) return null

  sequence += 1
  const comment: StoredComment = {
    id: `cmt-${sequence}`,
    author,
    content,
    createdAt: new Date().toISOString(),
    replies: [],
    reactions: [],
    isFeatured: false,
    isDeleted: false,
    attachments,
  }
  post.comments = [...post.comments, comment]

  if (post.author.id !== author.id) {
    pushNotification(post.author.id, 'reply_to_post', post.id, post.title, author.name, content)
  }
  createMentionNotifications(content, author, post)

  return toPublicPost(post, author.id)
}

/** Responde un comentario (1 nivel de anidación). Rechaza si la publicación está cerrada o eliminada. */
export function addReply(
  postId: string,
  commentId: string,
  author: ForumAuthor,
  content: string,
  attachments?: ForumAttachment[],
): ForumPost | null {
  const post = findStoredPost(postId)
  if (!post || post.isClosed || post.isDeleted) return null
  const comment = post.comments.find((item) => item.id === commentId)
  if (!comment) return null

  sequence += 1
  const reply: StoredReply = {
    id: `rep-${sequence}`,
    author,
    content,
    createdAt: new Date().toISOString(),
    reactions: [],
    isFeatured: false,
    isDeleted: false,
    attachments,
  }
  comment.replies = [...comment.replies, reply]

  if (comment.author.id !== author.id) {
    pushNotification(comment.author.id, 'reply_to_comment', post.id, post.title, author.name, content)
  }
  createMentionNotifications(content, author, post)

  return toPublicPost(post, author.id)
}

/** Alterna una reacción del usuario en sesión sobre un comentario o una respuesta. */
export function toggleReaction(
  postId: string,
  commentId: string,
  replyId: string | null,
  emoji: ForumReactionEmoji,
  userId: string,
): ForumPost | null {
  const post = findStoredPost(postId)
  if (!post) return null
  const comment = post.comments.find((item) => item.id === commentId)
  if (!comment) return null
  const target: StoredComment | StoredReply | undefined = replyId
    ? comment.replies.find((item) => item.id === replyId)
    : comment
  if (!target) return null

  let entry = target.reactions.find((item) => item.emoji === emoji)
  if (!entry) {
    entry = reaction(emoji, [])
    target.reactions = [...target.reactions, entry]
  }
  entry.userIds = entry.userIds.includes(userId)
    ? entry.userIds.filter((id) => id !== userId)
    : [...entry.userIds, userId]

  return toPublicPost(post, userId)
}

/**
 * Marca (o desmarca) un comentario/respuesta como "Respuesta destacada".
 * Solo Profesor o Administrador la marcan (la UI ya restringe el control;
 * aquí se valida de nuevo por seguridad). Al marcarla se registra un
 * `FeaturedAnswerEvent` — preparación para el Leaderboard, sin aplicar puntos.
 */
export function setFeatured(
  postId: string,
  commentId: string,
  replyId: string | null,
  featured: boolean,
  markedBy: ForumAuthor,
): ForumPost | null {
  if (markedBy.role !== 'profesor' && markedBy.role !== 'administrador') return null

  const post = findStoredPost(postId)
  if (!post) return null
  const comment = post.comments.find((item) => item.id === commentId)
  if (!comment) return null
  const target: StoredComment | StoredReply | undefined = replyId
    ? comment.replies.find((item) => item.id === replyId)
    : comment
  if (!target) return null

  target.isFeatured = featured
  target.featuredByName = featured ? markedBy.name : undefined
  target.featuredAt = featured ? new Date().toISOString() : undefined

  if (featured) {
    sequence += 1
    const event: FeaturedAnswerEvent = {
      id: `feat-${sequence}`,
      postId: post.id,
      targetId: target.id,
      targetType: replyId ? 'reply' : 'comment',
      authorId: target.author.id,
      authorName: target.author.name,
      markedByName: markedBy.name,
      markedByRole: markedBy.role,
      createdAt: new Date().toISOString(),
      pendingPoints: 15,
    }
    FEATURED_ANSWER_EVENTS = [event, ...FEATURED_ANSWER_EVENTS]
  }

  return toPublicPost(post, markedBy.id)
}

/** Profesor o Administrador fija/desfija una publicación (aparece primero en el listado). */
export function togglePin(postId: string, pinned: boolean, actor: ForumAuthor): ForumPost | null {
  if (actor.role !== 'profesor' && actor.role !== 'administrador') return null
  const post = findStoredPost(postId)
  if (!post) return null
  post.isPinned = pinned
  post.pinnedByName = pinned ? actor.name : undefined
  return toPublicPost(post, actor.id)
}

/** Profesor o Administrador cierra/reabre una discusión (bloquea comentarios y respuestas nuevas). */
export function toggleClosed(postId: string, closed: boolean, actor: ForumAuthor): ForumPost | null {
  if (actor.role !== 'profesor' && actor.role !== 'administrador') return null
  const post = findStoredPost(postId)
  if (!post) return null
  post.isClosed = closed
  post.closedByName = closed ? actor.name : undefined
  return toPublicPost(post, actor.id)
}

/** Notificaciones del usuario en sesión, de la más reciente a la más antigua. */
export function listNotifications(recipientId: string): ForumNotification[] {
  return NOTIFICATIONS.filter((item) => item.recipientId === recipientId).map(clone)
}

export function markNotificationRead(notificationId: string): void {
  const notification = NOTIFICATIONS.find((item) => item.id === notificationId)
  if (notification) notification.read = true
}

export function markAllNotificationsRead(recipientId: string): void {
  NOTIFICATIONS.forEach((item) => {
    if (item.recipientId === recipientId) item.read = true
  })
}

/** Eventos de "Respuesta destacada" registrados, listos para que un sprint futuro los conecte al Leaderboard. */
export function getFeaturedAnswerEvents(): FeaturedAnswerEvent[] {
  return FEATURED_ANSWER_EVENTS.map(clone)
}

// ---------------------------------------------------------------------------
// Moderación (Sprint 13.2)
// ---------------------------------------------------------------------------

function addModerationLog(entry: Omit<ModerationLogEntry, 'id' | 'createdAt' | 'restoredAt'>): ModerationLogEntry {
  sequence += 1
  const log: ModerationLogEntry = { ...entry, id: `modlog-${sequence}`, createdAt: new Date().toISOString() }
  MODERATION_LOG = [log, ...MODERATION_LOG]
  return log
}

/** Alumno, Profesor o Administrador reporta una publicación, comentario o respuesta. */
export function createReport(reporter: ForumAuthor, input: CreateForumReportInput): ForumReport | null {
  const post = findStoredPost(input.postId)
  if (!post) return null

  let contentExcerpt: string
  let contentAuthorId: string
  let contentAuthorName: string

  if (input.targetType === 'post') {
    contentExcerpt = post.title
    contentAuthorId = post.author.id
    contentAuthorName = post.author.name
  } else {
    const target = findCommentOrReply(post, input.targetType, input.targetId)
    if (!target) return null
    contentExcerpt = target.content
    contentAuthorId = target.author.id
    contentAuthorName = target.author.name
  }

  sequence += 1
  const report: ForumReport = {
    id: `report-${sequence}`,
    targetType: input.targetType,
    targetId: input.targetId,
    postId: post.id,
    postTitle: post.title,
    contentExcerpt: contentExcerpt.length > 140 ? `${contentExcerpt.slice(0, 140)}…` : contentExcerpt,
    contentAuthorId,
    contentAuthorName,
    reason: input.reason,
    description: input.description,
    reportedById: reporter.id,
    reportedByName: reporter.name,
    createdAt: new Date().toISOString(),
    status: 'pendiente',
  }
  REPORTS = [report, ...REPORTS]
  return clone(report)
}

export function listReports(status?: ForumReportStatus): ForumReport[] {
  return REPORTS.filter((item) => !status || item.status === status)
    .map(clone)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function resolveReportRecord(report: ForumReport, action: ForumModerationAction, moderator: ForumAuthor, note?: string) {
  report.status = action === 'ignorar' ? 'ignorado' : 'resuelto'
  report.resolution = action
  report.resolvedByName = moderator.name
  report.resolvedAt = new Date().toISOString()

  addModerationLog({
    action,
    targetType: report.targetType,
    targetId: report.targetId,
    postId: report.postId,
    postTitle: report.postTitle,
    targetAuthorId: report.contentAuthorId,
    targetAuthorName: report.contentAuthorName,
    performedByName: moderator.name,
    note,
    relatedReportId: report.id,
  })

  const resolutionMessage =
    action === 'ignorar'
      ? `Tu reporte sobre "${report.contentExcerpt}" fue revisado; no se encontraron infracciones.`
      : `Tu reporte sobre "${report.contentExcerpt}" fue resuelto.`
  pushNotification(report.reportedById, 'report_update', report.postId, report.postTitle, 'Moderación', resolutionMessage)
}

/** Administrador ignora o marca como resuelto un reporte, sin acción adicional sobre el contenido. */
export function reviewReport(reportId: string, action: 'ignorar' | 'resolver', moderator: ForumAuthor): ForumReport | null {
  if (moderator.role !== 'administrador') return null
  const report = REPORTS.find((item) => item.id === reportId)
  if (!report || report.status !== 'pendiente') return null

  resolveReportRecord(report, action, moderator)
  return clone(report)
}

/** Administrador elimina una publicación (borrado suave). Si viene de un reporte, también lo resuelve. */
export function deletePostContent(postId: string, moderator: ForumAuthor, relatedReportId?: string): ForumPost | null {
  if (moderator.role !== 'administrador') return null
  const post = findStoredPost(postId)
  if (!post) return null

  post.isDeleted = true
  post.deletedByName = moderator.name
  post.deletedAt = new Date().toISOString()

  addModerationLog({
    action: 'eliminar_publicacion',
    targetType: 'post',
    targetId: post.id,
    postId: post.id,
    postTitle: post.title,
    targetAuthorId: post.author.id,
    targetAuthorName: post.author.name,
    performedByName: moderator.name,
    relatedReportId,
  })

  if (post.author.id !== moderator.id) {
    pushNotification(post.author.id, 'content_removed', post.id, post.title, moderator.name, `Tu publicación "${post.title}" fue eliminada por moderación.`)
  }

  if (relatedReportId) {
    const report = REPORTS.find((item) => item.id === relatedReportId && item.status === 'pendiente')
    if (report) resolveReportRecord(report, 'eliminar_publicacion', moderator)
  }

  return toPublicPost(post, moderator.id)
}

/** Administrador elimina un comentario o respuesta (borrado suave, queda como "[Contenido eliminado]"). */
export function deleteCommentContent(
  postId: string,
  targetType: 'comment' | 'reply',
  targetId: string,
  moderator: ForumAuthor,
  relatedReportId?: string,
): ForumPost | null {
  if (moderator.role !== 'administrador') return null
  const post = findStoredPost(postId)
  if (!post) return null
  const target = findCommentOrReply(post, targetType, targetId)
  if (!target) return null

  target.isDeleted = true
  target.deletedByName = moderator.name
  target.deletedAt = new Date().toISOString()

  addModerationLog({
    action: 'eliminar_comentario',
    targetType,
    targetId,
    postId: post.id,
    postTitle: post.title,
    targetAuthorId: target.author.id,
    targetAuthorName: target.author.name,
    performedByName: moderator.name,
    relatedReportId,
  })

  if (target.author.id !== moderator.id) {
    pushNotification(
      target.author.id,
      'content_removed',
      post.id,
      post.title,
      moderator.name,
      `Tu comentario en "${post.title}" fue eliminado por moderación.`,
    )
  }

  if (relatedReportId) {
    const report = REPORTS.find((item) => item.id === relatedReportId && item.status === 'pendiente')
    if (report) resolveReportRecord(report, 'eliminar_comentario', moderator)
  }

  return toPublicPost(post, moderator.id)
}

/** Administrador restaura contenido eliminado, desde una entrada del historial de moderación. */
export function restoreContent(logEntryId: string, moderator: ForumAuthor): ModerationLogEntry | null {
  if (moderator.role !== 'administrador') return null
  const log = MODERATION_LOG.find((item) => item.id === logEntryId)
  if (!log || log.restoredAt) return null
  if (log.action !== 'eliminar_publicacion' && log.action !== 'eliminar_comentario') return null

  const post = findStoredPost(log.postId)
  if (!post) return null

  if (log.targetType === 'post') {
    post.isDeleted = false
    post.deletedByName = undefined
    post.deletedAt = undefined
  } else {
    const target = findCommentOrReply(post, log.targetType, log.targetId)
    if (!target) return null
    target.isDeleted = false
    target.deletedByName = undefined
    target.deletedAt = undefined
  }

  log.restoredAt = new Date().toISOString()
  addModerationLog({
    action: 'restaurar',
    targetType: log.targetType,
    targetId: log.targetId,
    postId: log.postId,
    postTitle: log.postTitle,
    targetAuthorId: log.targetAuthorId,
    targetAuthorName: log.targetAuthorName,
    performedByName: moderator.name,
    relatedReportId: log.relatedReportId,
  })

  return clone(log)
}

/**
 * Administrador envía una advertencia al autor del contenido reportado y
 * resuelve el reporte. La advertencia queda en el historial del usuario
 * (`listWarnings`/`getUserModerationStatuses`) — no bloquea ni suspende
 * nada todavía (ver `UserModerationStatus`).
 */
export function issueWarning(reportId: string, message: string, moderator: ForumAuthor): UserWarning | null {
  if (moderator.role !== 'administrador') return null
  const report = REPORTS.find((item) => item.id === reportId)
  if (!report) return null

  sequence += 1
  const warning: UserWarning = {
    id: `warn-${sequence}`,
    userId: report.contentAuthorId,
    userName: report.contentAuthorName,
    message,
    issuedByName: moderator.name,
    createdAt: new Date().toISOString(),
    relatedReportId: report.id,
  }
  WARNINGS = [warning, ...WARNINGS]

  // `resolveReportRecord` ya registra la entrada del historial (y notifica al
  // reportante) cuando el reporte seguía pendiente. Si ya estaba resuelto por
  // otra vía, se registra aquí para no perder la acción — nunca ambas veces.
  if (report.status === 'pendiente') {
    resolveReportRecord(report, 'advertencia', moderator, message)
  } else {
    addModerationLog({
      action: 'advertencia',
      targetType: report.targetType,
      targetId: report.targetId,
      postId: report.postId,
      postTitle: report.postTitle,
      targetAuthorId: report.contentAuthorId,
      targetAuthorName: report.contentAuthorName,
      performedByName: moderator.name,
      note: message,
      relatedReportId: report.id,
    })
  }

  pushNotification(report.contentAuthorId, 'warning_received', report.postId, report.postTitle, moderator.name, message)

  return clone(warning)
}

export function listWarnings(): UserWarning[] {
  return WARNINGS.map(clone).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function listModerationLog(): ModerationLogEntry[] {
  return MODERATION_LOG.map(clone).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/**
 * Estado de moderación agregado por usuario (Sprint 13.2, "Usuarios con
 * advertencias"). `isSuspended` siempre es `false`: el sprint prepara el
 * campo para una versión futura, pero no implementa suspensiones.
 */
export function getUserModerationStatuses(): UserModerationStatus[] {
  const byUser = new Map<string, UserModerationStatus>()

  for (const warning of WARNINGS) {
    const existing = byUser.get(warning.userId)
    if (existing) {
      existing.warningsCount += 1
      if (!existing.lastWarningAt || warning.createdAt > existing.lastWarningAt) {
        existing.lastWarningAt = warning.createdAt
      }
      continue
    }

    const author = Object.values(AUTHORS).find((item) => item.id === warning.userId)
    byUser.set(warning.userId, {
      userId: warning.userId,
      userName: warning.userName,
      role: author?.role ?? 'alumno',
      warningsCount: 1,
      lastWarningAt: warning.createdAt,
      isSuspended: false,
    })
  }

  return Array.from(byUser.values()).sort((a, b) => b.warningsCount - a.warningsCount)
}
