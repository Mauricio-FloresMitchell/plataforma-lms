import { useState } from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { FeaturedAnswerBadge } from '@/components/FeaturedAnswerBadge'
import { AuthorLine } from './AuthorLine'
import { ReactionBar } from './ReactionBar'
import { CommentForm } from './CommentForm'
import { ReportForm } from './ReportForm'
import type { ForumAttachment, ForumComment, ForumReactionEmoji, ForumReply, ForumReportReason } from '@/types/forum'
import type { Role } from '@/types/auth'
import { ForumAttachmentList } from './ForumAttachmentList'

interface CommentThreadProps {
  comments: ForumComment[]
  /** Rol del usuario en sesión: habilita "Destacar" (Profesor/Administrador). */
  currentUserRole: Role | undefined
  /** Administrador: puede eliminar comentarios/respuestas directamente. */
  canModerate: boolean
  /** Alumno/Profesor: pueden reportar comentarios/respuestas. */
  canReport: boolean
  /** Discusión cerrada: oculta "Responder" en todos los comentarios. */
  isClosed: boolean
  onReply: (commentId: string, content: string, attachments: ForumAttachment[]) => Promise<void>
  onReact: (commentId: string, replyId: string | null, emoji: ForumReactionEmoji) => void
  onToggleFeatured: (commentId: string, replyId: string | null, featured: boolean) => void
  onReport: (commentId: string, replyId: string | null, reason: ForumReportReason, description?: string) => Promise<void>
  onDelete: (commentId: string, replyId: string | null) => Promise<void>
}

/** Lista de comentarios con respuestas anidadas (1 nivel), reacciones, destacado, reporte y moderación. */
export function CommentThread({
  comments,
  currentUserRole,
  canModerate,
  canReport,
  isClosed,
  onReply,
  onReact,
  onToggleFeatured,
  onReport,
  onDelete,
}: CommentThreadProps) {
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null)
  const [openReportFor, setOpenReportFor] = useState<string | null>(null)
  const canFeature = currentUserRole === 'profesor' || currentUserRole === 'administrador'

  if (comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Sin comentarios"
        description="Sé la primera persona en participar en esta publicación."
      />
    )
  }

  async function handleReplySubmit(commentId: string, content: string, attachments: ForumAttachment[]) {
    await onReply(commentId, content, attachments)
    setOpenReplyFor(null)
  }

  async function handleReportSubmit(key: string, commentId: string, replyId: string | null, reason: ForumReportReason, description?: string) {
    await onReport(commentId, replyId, reason, description)
    setOpenReportFor((current) => (current === key ? null : current))
  }

  function renderActions(key: string, commentId: string, replyId: string | null, isFeatured: boolean, showReply: boolean) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {showReply ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setOpenReplyFor(openReplyFor === key ? null : key)}
          >
            Responder
          </Button>
        ) : null}
        {canFeature ? (
          <button
            type="button"
            onClick={() => onToggleFeatured(commentId, replyId, !isFeatured)}
            className="text-xs font-medium text-muted-foreground hover:text-primary"
          >
            {isFeatured ? 'Quitar destacado' : 'Destacar'}
          </button>
        ) : null}
        {canReport ? (
          <button
            type="button"
            onClick={() => setOpenReportFor(openReportFor === key ? null : key)}
            className="text-xs font-medium text-muted-foreground hover:text-destructive"
          >
            Reportar
          </button>
        ) : null}
        {canModerate ? (
          <button
            type="button"
            onClick={() => onDelete(commentId, replyId)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3" />
            Eliminar
          </button>
        ) : null}
      </div>
    )
  }

  function renderTombstone(deletedByName: string | undefined) {
    return (
      <p className="text-sm italic text-muted-foreground">
        [Contenido eliminado por moderación{deletedByName ? ` — ${deletedByName}` : ''}]
      </p>
    )
  }

  function renderReply(commentId: string, reply: ForumReply) {
    const key = `reply:${reply.id}`
    return (
      <li key={reply.id} className="flex flex-col gap-2">
        <AuthorLine author={reply.author} date={reply.createdAt} size="sm" />
        {reply.isFeatured ? <FeaturedAnswerBadge /> : null}
        {reply.isDeleted ? (
          renderTombstone(reply.deletedByName)
        ) : (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{reply.content}</p>
            {reply.attachments && reply.attachments.length > 0 ? <ForumAttachmentList attachments={reply.attachments} /> : null}
            <ReactionBar reactions={reply.reactions} onToggle={(emoji) => onReact(commentId, reply.id, emoji)} />
            {renderActions(key, commentId, reply.id, reply.isFeatured, false)}
            {openReportFor === key ? (
              <ReportForm
                onSubmit={(reason, description) => handleReportSubmit(key, commentId, reply.id, reason, description)}
                onCancel={() => setOpenReportFor(null)}
              />
            ) : null}
          </>
        )}
      </li>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => {
        const key = `comment:${comment.id}`
        return (
          <li key={comment.id}>
            <Card className="shadow-sm">
              <CardContent className="flex flex-col gap-3">
                <AuthorLine author={comment.author} date={comment.createdAt} size="sm" />
                {comment.isFeatured ? <FeaturedAnswerBadge /> : null}

                {comment.isDeleted ? (
                  renderTombstone(comment.deletedByName)
                ) : (
                  <>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{comment.content}</p>
                    {comment.attachments && comment.attachments.length > 0 ? <ForumAttachmentList attachments={comment.attachments} /> : null}
                    <ReactionBar reactions={comment.reactions} onToggle={(emoji) => onReact(comment.id, null, emoji)} />
                    {renderActions(key, comment.id, null, comment.isFeatured, !isClosed)}

                    {openReplyFor === comment.id ? (
                      <div className="pl-4">
                        <CommentForm
                          placeholder={`Responder a ${comment.author.name}…`}
                          submitLabel="Responder"
                          autoFocus
                          onSubmit={(content, attachments) => handleReplySubmit(comment.id, content, attachments)}
                          onCancel={() => setOpenReplyFor(null)}
                        />
                      </div>
                    ) : null}

                    {openReportFor === key ? (
                      <ReportForm
                        onSubmit={(reason, description) => handleReportSubmit(key, comment.id, null, reason, description)}
                        onCancel={() => setOpenReportFor(null)}
                      />
                    ) : null}
                  </>
                )}

                {comment.replies.length > 0 ? (
                  <ul className="flex flex-col gap-3 border-l border-border pl-4">
                    {comment.replies.map((reply) => renderReply(comment.id, reply))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
