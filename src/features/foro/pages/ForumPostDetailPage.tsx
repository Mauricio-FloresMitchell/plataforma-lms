import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileQuestion, Flag, Lock, MessageCircle, Pin, Trash2, Unlock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { BackLink } from '@/components/BackLink'
import { Breadcrumb } from '@/components/Breadcrumb'
import { EmptyState } from '@/components/EmptyState'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLE_HOME } from '@/routes/navigation'
import {
  addForumComment,
  addForumReply,
  buildForumAuthor,
  deleteForumComment,
  deleteForumPost,
  reportForumContent,
  setForumFeaturedAnswer,
  toggleForumClosed,
  toggleForumPin,
  toggleForumReaction,
} from '@/services/forum.service'
import type { ForumAttachment, ForumAuthor, ForumReactionEmoji, ForumReportReason } from '@/types/forum'
import { OpenChatButton } from '@/features/comunicacion/components/OpenChatButton'
import { AuthorLine } from '../components/AuthorLine'
import { CommentThread } from '../components/CommentThread'
import { CommentForm } from '../components/CommentForm'
import { ReportForm } from '../components/ReportForm'
import { ForumAttachmentList } from '../components/ForumAttachmentList'
import { useForumPost } from '../hooks/useForumPost'

/** Detalle de una publicación con comentarios, respuestas y controles de moderación. */
export function ForumPostDetailPage() {
  const { postId } = useParams()
  const { user } = useAuth()
  const { post, isLoading, notFound, setPost } = useForumPost(postId, user?.id)
  const roleHome = user ? ROLE_HOME[user.role] : '/'
  const [showReportPost, setShowReportPost] = useState(false)
  const [reportConfirmation, setReportConfirmation] = useState<string | null>(null)

  const currentAuthor: ForumAuthor | null = user ? buildForumAuthor(user) : null

  const canModerate = user?.role === 'administrador'
  const canPinOrClose = user?.role === 'profesor' || user?.role === 'administrador'
  const canReport = user?.role === 'alumno' || user?.role === 'profesor'

  async function handleNewComment(content: string, attachments: ForumAttachment[]) {
    if (!post || !currentAuthor) return
    const updated = await addForumComment(post.id, currentAuthor, content, attachments)
    if (updated) setPost(updated)
  }

  async function handleReply(commentId: string, content: string, attachments: ForumAttachment[]) {
    if (!post || !currentAuthor) return
    const updated = await addForumReply(post.id, commentId, currentAuthor, content, attachments)
    if (updated) setPost(updated)
  }

  async function handleReact(commentId: string, replyId: string | null, emoji: ForumReactionEmoji) {
    if (!post || !currentAuthor) return
    const updated = await toggleForumReaction(post.id, commentId, replyId, emoji, currentAuthor.id)
    if (updated) setPost(updated)
  }

  async function handleToggleFeatured(commentId: string, replyId: string | null, featured: boolean) {
    if (!post || !currentAuthor) return
    const updated = await setForumFeaturedAnswer(post.id, commentId, replyId, featured, currentAuthor)
    if (updated) setPost(updated)
  }

  async function handleTogglePin() {
    if (!post || !currentAuthor) return
    const updated = await toggleForumPin(post.id, !post.isPinned, currentAuthor)
    if (updated) setPost(updated)
  }

  async function handleToggleClosed() {
    if (!post || !currentAuthor) return
    const updated = await toggleForumClosed(post.id, !post.isClosed, currentAuthor)
    if (updated) setPost(updated)
  }

  async function handleDeletePost() {
    if (!post || !currentAuthor) return
    if (!window.confirm('¿Eliminar esta publicación? Podrás restaurarla desde el Centro de Moderación.')) return
    const updated = await deleteForumPost(post.id, currentAuthor)
    if (updated) setPost(updated)
  }

  async function handleDeleteComment(commentId: string, replyId: string | null) {
    if (!post || !currentAuthor) return
    if (!window.confirm('¿Eliminar este contenido? Podrás restaurarlo desde el Centro de Moderación.')) return
    const updated = await deleteForumComment(post.id, replyId ? 'reply' : 'comment', replyId ?? commentId, currentAuthor)
    if (updated) setPost(updated)
  }

  async function handleReportPost(reason: ForumReportReason, description?: string) {
    if (!post || !currentAuthor) return
    await reportForumContent(currentAuthor, { targetType: 'post', targetId: post.id, postId: post.id, reason, description })
    setShowReportPost(false)
    setReportConfirmation('Gracias por reportar. El equipo de moderación lo revisará.')
  }

  async function handleReportComment(commentId: string, replyId: string | null, reason: ForumReportReason, description?: string) {
    if (!post || !currentAuthor) return
    await reportForumContent(currentAuthor, {
      targetType: replyId ? 'reply' : 'comment',
      targetId: replyId ?? commentId,
      postId: post.id,
      reason,
      description,
    })
    setReportConfirmation('Gracias por reportar. El equipo de moderación lo revisará.')
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: roleHome },
          { label: 'Foro académico', to: '/foro' },
          { label: post?.title ?? 'Publicación' },
        ]}
      />
      <BackLink to="/foro" />

      {isLoading ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : notFound || !post ? (
        <EmptyState
          icon={FileQuestion}
          title="Publicación no encontrada"
          description="La publicación que buscas no existe o no está disponible."
        />
      ) : (
        <>
          {post.isDeleted ? (
            <Alert variant="destructive">
              <Trash2 className="size-4" />
              <AlertDescription>
                Esta publicación fue eliminada por moderación{post.deletedByName ? ` (${post.deletedByName})` : ''}.
                {canModerate ? ' Puedes restaurarla desde el Centro de Moderación.' : ''}
              </AlertDescription>
            </Alert>
          ) : null}

          {reportConfirmation ? (
            <Alert>
              <AlertDescription>{reportConfirmation}</AlertDescription>
            </Alert>
          ) : null}

          <Card className="shadow-sm">
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{post.categoryName}</Badge>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
                {post.isPinned ? (
                  <Badge className="gap-1 bg-amber-100 text-amber-800">
                    <Pin className="size-3" />
                    Fijada
                  </Badge>
                ) : null}
                {post.isClosed ? (
                  <Badge className="gap-1 bg-slate-200 text-slate-700">
                    <Lock className="size-3" />
                    Discusión cerrada
                  </Badge>
                ) : null}
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{post.title}</h2>
              <AuthorLine author={post.author} date={post.createdAt} />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                {post.content}
              </p>
              {post.attachments && post.attachments.length > 0 ? <ForumAttachmentList attachments={post.attachments} /> : null}

              {!post.isDeleted ? (
                <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
                  {canPinOrClose ? (
                    <Button variant="outline" size="sm" className="h-8" onClick={handleTogglePin}>
                      <Pin className="size-3.5" />
                      {post.isPinned ? 'Desfijar' : 'Fijar'}
                    </Button>
                  ) : null}
                  {canPinOrClose ? (
                    <Button variant="outline" size="sm" className="h-8" onClick={handleToggleClosed}>
                      {post.isClosed ? <Unlock className="size-3.5" /> : <Lock className="size-3.5" />}
                      {post.isClosed ? 'Reabrir discusión' : 'Cerrar discusión'}
                    </Button>
                  ) : null}
                  {canReport && !showReportPost ? (
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={() => setShowReportPost(true)}>
                      <Flag className="size-3.5" />
                      Reportar
                    </Button>
                  ) : null}
                  {user && !(user.role === 'alumno' && post.author.role === 'alumno') ? (
                    <OpenChatButton
                      recipientId={post.author.id}
                      recipientName={post.author.name}
                      label="Contactar autor"
                      icon={MessageCircle}
                      draftMessage={`Hola, vi tu publicación "${post.title}" en el foro y quería comentarte algo.`}
                      contextType="foro"
                      contextId={post.id}
                      contextLabel={post.title}
                      variant="ghost"
                      className="h-8 text-muted-foreground"
                    />
                  ) : null}
                  {canModerate ? (
                    <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive" onClick={handleDeletePost}>
                      <Trash2 className="size-3.5" />
                      Eliminar publicación
                    </Button>
                  ) : null}
                </div>
              ) : null}

              {showReportPost ? <ReportForm onSubmit={handleReportPost} onCancel={() => setShowReportPost(false)} /> : null}
            </CardContent>
          </Card>

          {post.isClosed && !post.isDeleted ? (
            <Alert>
              <Lock className="size-4" />
              <AlertDescription>
                Esta discusión académica está cerrada{post.closedByName ? ` por ${post.closedByName}` : ''}. No se pueden agregar comentarios nuevos.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              Comentarios ({post.commentCount})
            </h3>

            {currentAuthor && !post.isClosed && !post.isDeleted ? <CommentForm onSubmit={handleNewComment} /> : null}

            <CommentThread
              comments={post.comments}
              currentUserRole={user?.role}
              canModerate={canModerate}
              canReport={canReport}
              isClosed={post.isClosed}
              onReply={handleReply}
              onReact={handleReact}
              onToggleFeatured={handleToggleFeatured}
              onReport={handleReportComment}
              onDelete={handleDeleteComment}
            />
          </div>
        </>
      )}
    </div>
  )
}
