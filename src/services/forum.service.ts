import {
  FORUM_CATEGORIES,
  addComment,
  addReply,
  createReport,
  deleteCommentContent,
  deletePostContent,
  findPost,
  getFeaturedAnswerEvents,
  getUserModerationStatuses,
  insertPost,
  issueWarning,
  listModerationLog,
  listNotifications,
  listPosts,
  listReports,
  listWarnings,
  markAllNotificationsRead,
  markNotificationRead,
  restoreContent,
  reviewReport,
  setFeatured,
  toggleClosed,
  togglePin,
  toggleReaction,
} from '@/mocks/forum'
import { emitAppEvent } from '@/core/events/EventBus'
import { recordAudit } from '@/services/audit.service'
import type {
  CreateForumPostInput,
  CreateForumReportInput,
  FeaturedAnswerEvent,
  ForumAttachment,
  ForumAuthor,
  ForumCategory,
  ForumNotification,
  ForumPost,
  ForumPostSummary,
  ForumReactionEmoji,
  ForumReport,
  ForumReportStatus,
  ModerationLogEntry,
  UserModerationStatus,
  UserWarning,
} from '@/types/forum'

/**
 * Capa de acceso a datos del Foro Académico.
 *
 * Es el único punto que conoce el origen de los datos.
 * Migrar a una API real implica reemplazar el cuerpo de estas funciones;
 * la firma pública y los componentes no cambian.
 */

const NETWORK_DELAY_MS = 500

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toSummary(post: ForumPost): ForumPostSummary {
  const { content: _content, comments: _comments, ...summary } = post
  return summary
}

export async function getForumCategories(): Promise<ForumCategory[]> {
  await delay(NETWORK_DELAY_MS)
  return [...FORUM_CATEGORIES]
}

/** Feed de publicaciones: fijadas primero, luego de la más reciente a la más antigua. Excluye eliminadas. */
export async function getForumPosts(): Promise<ForumPostSummary[]> {
  await delay(NETWORK_DELAY_MS)
  return listPosts()
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .map(toSummary)
}

/** Detalle de una publicación con comentarios y respuestas, con reacciones resueltas para `viewerId`. */
export async function getForumPost(postId: string, viewerId?: string): Promise<ForumPost | null> {
  await delay(NETWORK_DELAY_MS)
  return findPost(postId, viewerId)
}

/**
 * Crea una publicación. Estado en memoria durante la sesión; sin persistencia real.
 */
export async function createForumPost(
  author: ForumAuthor,
  input: CreateForumPostInput,
): Promise<ForumPost> {
  await delay(NETWORK_DELAY_MS)
  const post = insertPost(author, input)
  emitAppEvent('FORUM_POST_CREATED', {
    postId: post.id,
    postTitle: post.title,
    actorId: author.id,
    actorName: author.name,
  })
  return post
}

/** Crea un comentario nuevo en una publicación. Notifica al autor de la publicación y a las menciones (Sprint 13.1). */
export async function addForumComment(
  postId: string,
  author: ForumAuthor,
  content: string,
  attachments?: ForumAttachment[],
): Promise<ForumPost | null> {
  await delay(NETWORK_DELAY_MS)
  const post = addComment(postId, author, content, attachments)
  if (post) {
    const newComment = post.comments[post.comments.length - 1]
    emitAppEvent('FORUM_COMMENT_CREATED', {
      postId: post.id,
      postTitle: post.title,
      commentId: newComment.id,
      actorId: author.id,
      actorName: author.name,
      recipientId: post.author.id,
    })
  }
  return post
}

/** Responde un comentario (1 nivel de anidación). Notifica al autor del comentario y a las menciones. */
export async function addForumReply(
  postId: string,
  commentId: string,
  author: ForumAuthor,
  content: string,
  attachments?: ForumAttachment[],
): Promise<ForumPost | null> {
  await delay(NETWORK_DELAY_MS)
  const post = addReply(postId, commentId, author, content, attachments)
  if (post) {
    const comment = post.comments.find((item) => item.id === commentId)
    const newReply = comment?.replies[comment.replies.length - 1]
    if (comment && newReply) {
      emitAppEvent('FORUM_REPLY_CREATED', {
        postId: post.id,
        postTitle: post.title,
        commentId: newReply.id,
        actorId: author.id,
        actorName: author.name,
        recipientId: comment.author.id,
      })
    }
  }
  return post
}

/** Alterna una reacción (👍 ❤️ 💡) del usuario en sesión sobre un comentario o una respuesta. */
export async function toggleForumReaction(
  postId: string,
  commentId: string,
  replyId: string | null,
  emoji: ForumReactionEmoji,
  userId: string,
): Promise<ForumPost | null> {
  await delay(200)
  return toggleReaction(postId, commentId, replyId, emoji, userId)
}

/** Marca (o desmarca) una respuesta destacada. Solo Profesor o Administrador. */
export async function setForumFeaturedAnswer(
  postId: string,
  commentId: string,
  replyId: string | null,
  featured: boolean,
  markedBy: ForumAuthor,
): Promise<ForumPost | null> {
  await delay(NETWORK_DELAY_MS)
  return setFeatured(postId, commentId, replyId, featured, markedBy)
}

/** Fija/desfija una publicación (Profesor o Administrador). */
export async function toggleForumPin(postId: string, pinned: boolean, actor: ForumAuthor): Promise<ForumPost | null> {
  await delay(NETWORK_DELAY_MS)
  return togglePin(postId, pinned, actor)
}

/** Cierra/reabre una discusión (Profesor o Administrador): bloquea comentarios y respuestas nuevas. */
export async function toggleForumClosed(postId: string, closed: boolean, actor: ForumAuthor): Promise<ForumPost | null> {
  await delay(NETWORK_DELAY_MS)
  return toggleClosed(postId, closed, actor)
}

/** Notificaciones internas del usuario en sesión (respondieron tu publicación/comentario, te mencionaron, moderación). */
export async function getForumNotifications(recipientId: string): Promise<ForumNotification[]> {
  await delay(NETWORK_DELAY_MS)
  return listNotifications(recipientId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export async function markForumNotificationRead(notificationId: string): Promise<void> {
  await delay(150)
  markNotificationRead(notificationId)
}

export async function markAllForumNotificationsRead(recipientId: string): Promise<void> {
  await delay(150)
  markAllNotificationsRead(recipientId)
}

/** Eventos de "Respuesta destacada" preparados para el Leaderboard (sin puntos aplicados). */
export async function getForumFeaturedAnswerEvents(): Promise<FeaturedAnswerEvent[]> {
  await delay(150)
  return getFeaturedAnswerEvents()
}

// ---------------------------------------------------------------------------
// Moderación (Sprint 13.2)
// ---------------------------------------------------------------------------

/** Alumno, Profesor o Administrador reporta una publicación, comentario o respuesta. */
export async function reportForumContent(reporter: ForumAuthor, input: CreateForumReportInput): Promise<ForumReport | null> {
  await delay(NETWORK_DELAY_MS)
  const report = createReport(reporter, input)
  if (report) {
    emitAppEvent(report.targetType === 'post' ? 'FORUM_POST_REPORTED' : 'FORUM_COMMENT_REPORTED', {
      reportId: report.id,
      postId: report.postId,
      postTitle: report.postTitle,
      targetType: report.targetType,
      reason: report.reason,
    })
  }
  return report
}

/** Reportes para el Centro de Moderación, opcionalmente filtrados por estado. */
export async function getForumReports(status?: ForumReportStatus): Promise<ForumReport[]> {
  await delay(NETWORK_DELAY_MS)
  return listReports(status)
}

/** Administrador ignora o marca como resuelto un reporte sin acción adicional sobre el contenido. */
export async function reviewForumReport(
  reportId: string,
  action: 'ignorar' | 'resolver',
  moderator: ForumAuthor,
): Promise<ForumReport | null> {
  await delay(NETWORK_DELAY_MS)
  const report = reviewReport(reportId, action, moderator)
  if (report) recordAudit(moderator, 'Foro', `${action === 'resolver' ? 'Resolvió' : 'Ignoró'} el reporte de "${report.postTitle}"`)
  return report
}

/** Administrador elimina una publicación (borrado suave, restaurable). */
export async function deleteForumPost(
  postId: string,
  moderator: ForumAuthor,
  relatedReportId?: string,
): Promise<ForumPost | null> {
  await delay(NETWORK_DELAY_MS)
  const post = deletePostContent(postId, moderator, relatedReportId)
  if (post) recordAudit(moderator, 'Foro', `Eliminó la publicación "${post.title}"`)
  return post
}

/** Administrador elimina un comentario o respuesta (borrado suave, restaurable). */
export async function deleteForumComment(
  postId: string,
  targetType: 'comment' | 'reply',
  targetId: string,
  moderator: ForumAuthor,
  relatedReportId?: string,
): Promise<ForumPost | null> {
  await delay(NETWORK_DELAY_MS)
  const post = deleteCommentContent(postId, targetType, targetId, moderator, relatedReportId)
  if (post) recordAudit(moderator, 'Foro', `Eliminó un ${targetType === 'comment' ? 'comentario' : 'respuesta'} de "${post.title}"`)
  return post
}

/** Administrador restaura contenido eliminado desde una entrada del historial de moderación. */
export async function restoreForumContent(logEntryId: string, moderator: ForumAuthor): Promise<ModerationLogEntry | null> {
  await delay(NETWORK_DELAY_MS)
  const entry = restoreContent(logEntryId, moderator)
  if (entry) recordAudit(moderator, 'Foro', `Restauró "${entry.postTitle}"`)
  return entry
}

/** Administrador envía una advertencia al autor del contenido reportado; resuelve el reporte y notifica a ambas partes. */
export async function issueForumWarning(reportId: string, message: string, moderator: ForumAuthor): Promise<UserWarning | null> {
  await delay(NETWORK_DELAY_MS)
  const warning = issueWarning(reportId, message, moderator)
  if (warning) {
    emitAppEvent('ADMIN_WARNING_SENT', {
      userId: warning.userId,
      userName: warning.userName,
      message: warning.message,
      issuedByName: warning.issuedByName,
    })
    recordAudit(moderator, 'Foro', `Advirtió a ${warning.userName}: ${warning.message}`)
  }
  return warning
}

export async function getForumWarnings(): Promise<UserWarning[]> {
  await delay(NETWORK_DELAY_MS)
  return listWarnings()
}

export async function getForumModerationLog(): Promise<ModerationLogEntry[]> {
  await delay(NETWORK_DELAY_MS)
  return listModerationLog()
}

/** Estado de moderación agregado por usuario ("Usuarios con advertencias"). */
export async function getForumUserModerationStatuses(): Promise<UserModerationStatus[]> {
  await delay(NETWORK_DELAY_MS)
  return getUserModerationStatuses()
}
