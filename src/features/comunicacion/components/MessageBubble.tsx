import { useState } from 'react'
import { Check, CheckCheck, Download, Pencil, Reply, Smile, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/utils/date'
import { REACTION_EMOJIS } from '@/types/chat'
import type { MessageWithDetails, ReactionEmoji } from '@/types/chat'

const EDIT_WINDOW_MS = 5 * 60 * 1000

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface MessageBubbleProps {
  message: MessageWithDetails
  currentUserId: string
  showSenderName: boolean
  onReply: (message: MessageWithDetails) => void
  onEdit: (messageId: string, content: string) => Promise<void>
  onDelete: (messageId: string) => Promise<void>
  onToggleReaction: (messageId: string, emoji: ReactionEmoji, alreadyReacted: boolean) => void
}

/** Burbuja de un mensaje (Parte 3/4): contenido, adjunto, responder/editar/eliminar, reacciones, estado. */
export function MessageBubble({ message, currentUserId, showSenderName, onReply, onEdit, onDelete, onToggleReaction }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(message.content)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const isOwn = message.senderId === currentUserId
  const canEdit = isOwn && !message.deleted && Date.now() - new Date(message.createdAt).getTime() <= EDIT_WINDOW_MS

  async function handleSaveEdit() {
    if (editValue.trim() && editValue.trim() !== message.content) {
      await onEdit(message.id, editValue.trim())
    }
    setIsEditing(false)
  }

  const reactionCounts = REACTION_EMOJIS.map((emoji) => ({
    emoji,
    count: message.reactions.filter((reaction) => reaction.emoji === emoji).length,
    reactedByMe: message.reactions.some((reaction) => reaction.userId === currentUserId && reaction.emoji === emoji),
  })).filter((entry) => entry.count > 0)

  return (
    <div className={cn('group flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
      {showSenderName && !isOwn ? <span className="px-1 text-xs font-medium text-muted-foreground">{message.senderName}</span> : null}

      <div className={cn('flex items-center gap-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
        <div
          className={cn(
            'max-w-md rounded-2xl px-3.5 py-2.5 text-sm',
            isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
          )}
        >
          {message.replyTo ? (
            <div
              className={cn(
                'mb-1.5 rounded-lg border-l-2 px-2 py-1 text-xs opacity-80',
                isOwn ? 'border-primary-foreground/40' : 'border-foreground/20',
              )}
            >
              {message.replyTo.deleted ? 'Mensaje eliminado' : message.replyTo.content}
            </div>
          ) : null}

          {message.deleted ? (
            <p className="italic opacity-70">Mensaje eliminado</p>
          ) : isEditing ? (
            <div className="flex flex-col gap-2">
              <Textarea
                value={editValue}
                onChange={(event) => setEditValue(event.target.value)}
                rows={2}
                className="min-w-56 bg-background text-foreground"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button size="sm" className="h-7 text-xs" onClick={() => void handleSaveEdit()}>
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              {message.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  download={attachment.fileName}
                  className={cn(
                    'mt-2 flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs',
                    isOwn ? 'border-primary-foreground/30' : 'border-border',
                  )}
                >
                  <Download className="size-3.5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{attachment.fileName}</span>
                  <span className="shrink-0 opacity-70">{formatFileSize(attachment.size)}</span>
                </a>
              ))}
            </>
          )}
        </div>

        {!message.deleted && !isEditing ? (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon-sm" onClick={() => setShowEmojiPicker((current) => !current)} aria-label="Reaccionar">
              <Smile className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => onReply(message)} aria-label="Responder">
              <Reply className="size-3.5" />
            </Button>
            {canEdit ? (
              <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(true)} aria-label="Editar">
                <Pencil className="size-3.5" />
              </Button>
            ) : null}
            {isOwn ? (
              <Button variant="ghost" size="icon-sm" onClick={() => void onDelete(message.id)} aria-label="Eliminar">
                <Trash2 className="size-3.5" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {showEmojiPicker ? (
        <div className="flex gap-1 rounded-full border border-border bg-popover px-2 py-1 shadow-sm">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded-full p-1 text-sm hover:bg-accent"
              onClick={() => {
                const alreadyReacted = message.reactions.some((r) => r.userId === currentUserId && r.emoji === emoji)
                onToggleReaction(message.id, emoji, alreadyReacted)
                setShowEmojiPicker(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}

      {reactionCounts.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {reactionCounts.map(({ emoji, count, reactedByMe }) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onToggleReaction(message.id, emoji, reactedByMe)}
              className={cn(
                'flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs',
                reactedByMe ? 'border-primary bg-primary/10' : 'border-border bg-background',
              )}
            >
              <span>{emoji}</span>
              <span className="text-muted-foreground">{count}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
        <span>{formatDateTime(message.createdAt)}</span>
        {message.edited ? <span>· editado</span> : null}
        {isOwn ? (
          <span className="flex items-center">
            {message.status === 'leido' ? (
              <CheckCheck className="size-3.5 text-primary" />
            ) : message.status === 'entregado' ? (
              <CheckCheck className="size-3.5" />
            ) : (
              <Check className="size-3.5" />
            )}
          </span>
        ) : null}
      </div>
    </div>
  )
}
